import { prisma } from "@/lib/prisma";
import {
  LOGIN_LOCKOUT,
  type AuthRealm,
} from "@/lib/auth/constants";
import {
  hashPassword,
  normalizeEmail,
  validatePasswordStrength,
  verifyPassword,
} from "@/lib/auth/password";
import { issueSession } from "@/lib/auth/session";
import {
  isAdminRole,
  isExecutiveRole,
  staffRealmToRole,
  staffRoleToRealm,
} from "@/lib/auth/staff-role";
import {
  getSubscriptionBlockReason,
  isSubscriptionActive,
} from "@/lib/auth/subscription";
import { generateTemporaryPassword } from "@/lib/auth/temp-password";
import type {
  AdminSessionUser,
  ExecutiveSessionUser,
  LoginCredentials,
} from "@/lib/auth/types";
import type {
  CreateStaffAccountInput,
  StaffAccountRecord,
  StaffRealm,
  UpdateStaffAccountInput,
} from "@/types/staff-account";
import type { StaffAccount, SubscriptionStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/api-error";

const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";

function mapStaffRecord(account: StaffAccount): StaffAccountRecord {
  const realm = staffRoleToRealm(account.role);

  return {
    id: account.id,
    realm,
    email: account.email,
    fullName: account.fullName,
    active: account.active,
    mustChangePassword: account.mustChangePassword,
    lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
    phone: account.phone,
    rut: account.rut,
    subscriptionStatus: account.subscriptionStatus ?? undefined,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    assignmentsSuspended: account.assignmentsSuspended,
    onboardingCompleted: account.onboardingCompleted,
  };
}

function mapExecutiveSessionUser(account: StaffAccount): ExecutiveSessionUser {
  const subscriptionStatus = account.subscriptionStatus ?? "TRIAL";
  const subscriptionActive = isSubscriptionActive({
    subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt,
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    phone: account.phone,
    rut: account.rut,
    subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
    mustChangePassword: account.mustChangePassword,
    onboardingCompleted: account.onboardingCompleted,
    assignmentsSuspended: account.assignmentsSuspended,
  };
}

function mapAdminSessionUser(account: StaffAccount): AdminSessionUser {
  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    mustChangePassword: account.mustChangePassword,
  };
}

function isAccountLocked(lockedUntil: Date | null): boolean {
  return Boolean(lockedUntil && lockedUntil.getTime() > Date.now());
}

async function registerFailedLogin(accountId: string, failedAttempts: number): Promise<void> {
  const nextAttempts = failedAttempts + 1;
  const shouldLock = nextAttempts >= LOGIN_LOCKOUT.maxAttempts;
  const lockedUntil = shouldLock
    ? new Date(Date.now() + LOGIN_LOCKOUT.lockMinutes * 60 * 1000)
    : null;

  await prisma.staffAccount.update({
    where: { id: accountId },
    data: {
      failedLoginAttempts: nextAttempts,
      lockedUntil,
    },
  });
}

async function registerSuccessfulLogin(accountId: string): Promise<void> {
  await prisma.staffAccount.update({
    where: { id: accountId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
}

async function readStaffByEmail(email: string): Promise<StaffAccount | null> {
  return prisma.staffAccount.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

async function assertStaffRealm(
  id: string,
  expectedRealm: StaffRealm,
): Promise<StaffAccount> {
  const account = await prisma.staffAccount.findUnique({ where: { id } });

  if (!account) {
    throw new ApiError("Usuario no encontrado.", 404, "NOT_FOUND");
  }

  if (staffRoleToRealm(account.role) !== expectedRealm) {
    throw new ApiError("El rol del usuario no coincide.", 400, "ROLE_MISMATCH");
  }

  return account;
}

async function authenticateStaffAccount(
  account: StaffAccount,
  credentials: LoginCredentials,
): Promise<{ realm: AuthRealm; user: AdminSessionUser | ExecutiveSessionUser }> {
  if (!account.active) {
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  if (isAccountLocked(account.lockedUntil)) {
    throw new ApiError(
      "Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde.",
      423,
      "ACCOUNT_LOCKED",
    );
  }

  const passwordValid = await verifyPassword(
    credentials.password,
    account.passwordHash,
  );

  if (!passwordValid) {
    await registerFailedLogin(account.id, account.failedLoginAttempts);
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  const realm = staffRoleToRealm(account.role);

  if (isExecutiveRole(account.role)) {
    const subscriptionStatus = account.subscriptionStatus ?? "TRIAL";
    const subscriptionActive = isSubscriptionActive({
      subscriptionStatus,
      subscriptionExpiresAt: account.subscriptionExpiresAt,
    });

    if (!subscriptionActive) {
      const reason = getSubscriptionBlockReason({
        subscriptionStatus,
        subscriptionExpiresAt: account.subscriptionExpiresAt,
      });

      throw new ApiError(
        reason ?? "Suscripción inactiva.",
        403,
        "SUBSCRIPTION_INACTIVE",
      );
    }
  }

  await registerSuccessfulLogin(account.id);
  await issueSession({
    accountId: account.id,
    email: account.email,
    realm,
    mustChangePassword: account.mustChangePassword,
  });

  return {
    realm,
    user: isAdminRole(account.role)
      ? mapAdminSessionUser(account)
      : mapExecutiveSessionUser(account),
  };
}

export async function authenticateAdmin(
  credentials: LoginCredentials,
): Promise<AdminSessionUser> {
  const account = await readStaffByEmail(credentials.email);

  if (!account || !isAdminRole(account.role)) {
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  const { user } = await authenticateStaffAccount(account, credentials);
  return user as AdminSessionUser;
}

export async function authenticateExecutive(
  credentials: LoginCredentials,
): Promise<ExecutiveSessionUser> {
  const account = await readStaffByEmail(credentials.email);

  if (!account || !isExecutiveRole(account.role)) {
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  const { user } = await authenticateStaffAccount(account, credentials);
  return user as ExecutiveSessionUser;
}

export async function authenticateStaff(
  credentials: LoginCredentials,
): Promise<{
  realm: AuthRealm;
  user: AdminSessionUser | ExecutiveSessionUser;
}> {
  const account = await readStaffByEmail(credentials.email);

  if (!account) {
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  return authenticateStaffAccount(account, credentials);
}

export async function readAdminById(
  id: string,
): Promise<AdminSessionUser | null> {
  const account = await prisma.staffAccount.findUnique({ where: { id } });

  if (!account || !account.active || !isAdminRole(account.role)) return null;

  return mapAdminSessionUser(account);
}

export async function readAdminByEmail(
  email: string,
): Promise<AdminSessionUser | null> {
  const account = await readStaffByEmail(email);

  if (!account || !account.active || !isAdminRole(account.role)) return null;

  return mapAdminSessionUser(account);
}

export async function readExecutiveById(
  id: string,
): Promise<ExecutiveSessionUser | null> {
  const account = await prisma.staffAccount.findUnique({ where: { id } });

  if (!account || !account.active || !isExecutiveRole(account.role)) return null;

  return mapExecutiveSessionUser(account);
}

export async function readStaffById(id: string): Promise<StaffAccount | null> {
  return prisma.staffAccount.findUnique({ where: { id } });
}

export async function listStaffAccounts(): Promise<StaffAccountRecord[]> {
  const accounts = await prisma.staffAccount.findMany({
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(mapStaffRecord);
}

export async function listExecutiveStaffAccounts(): Promise<StaffAccountRecord[]> {
  const accounts = await prisma.staffAccount.findMany({
    where: { role: "EXECUTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return accounts.map(mapStaffRecord);
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<{ account: StaffAccountRecord; temporaryPassword: string }> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName?.trim() || email.split("@")[0];
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const role = staffRealmToRole(input.realm);

  if (!fullName) {
    throw new ApiError("El nombre es obligatorio.", 400, "INVALID_INPUT");
  }

  const existing = await prisma.staffAccount.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError("Ya existe una cuenta con ese correo.", 409, "EMAIL_EXISTS");
  }

  if (isAdminRole(role)) {
    const account = await prisma.staffAccount.create({
      data: {
        email,
        fullName,
        role,
        passwordHash,
        active: true,
        mustChangePassword: true,
        onboardingCompleted: true,
      },
    });

    return { temporaryPassword, account: mapStaffRecord(account) };
  }

  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
  const subscriptionStatus: SubscriptionStatus =
    input.subscriptionStatus ?? "TRIAL";

  const account = await prisma.staffAccount.create({
    data: {
      email,
      fullName,
      role,
      phone: input.phone?.trim() || null,
      rut: input.rut?.trim() || null,
      passwordHash,
      active: true,
      mustChangePassword: true,
      subscriptionStatus,
      subscriptionExpiresAt:
        subscriptionStatus === "TRIAL" ? trialExpiresAt : null,
    },
  });

  return { temporaryPassword, account: mapStaffRecord(account) };
}

export async function updateStaffAccount(
  realm: StaffRealm,
  id: string,
  input: UpdateStaffAccountInput,
): Promise<StaffAccountRecord> {
  await assertStaffRealm(id, realm);

  if (realm === "admin") {
    const account = await prisma.staffAccount.update({
      where: { id },
      data: {
        active: input.active,
        fullName: input.fullName?.trim(),
      },
    });

    return mapStaffRecord(account);
  }

  const account = await prisma.staffAccount.update({
    where: { id },
    data: {
      active: input.active,
      fullName: input.fullName?.trim(),
      phone: input.phone,
      rut: input.rut,
      subscriptionStatus: input.subscriptionStatus,
      assignmentsSuspended: input.assignmentsSuspended,
    },
  });

  return mapStaffRecord(account);
}

export async function resetStaffTemporaryPassword(
  realm: StaffRealm,
  id: string,
): Promise<{ account: StaffAccountRecord; temporaryPassword: string }> {
  await assertStaffRealm(id, realm);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const account = await prisma.staffAccount.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
    },
  });

  return { temporaryPassword, account: mapStaffRecord(account) };
}

export async function deleteStaffAccount(
  realm: StaffRealm,
  id: string,
): Promise<void> {
  await assertStaffRealm(id, realm);
  await prisma.staffAccount.delete({ where: { id } });
}

export async function completeExecutiveOnboarding(
  accountId: string,
  input: { firstName: string; lastName: string; phone: string; rut: string },
): Promise<ExecutiveSessionUser> {
  const account = await prisma.staffAccount.findUnique({
    where: { id: accountId },
  });

  if (!account || !account.active || !isExecutiveRole(account.role)) {
    throw new ApiError("Cuenta no encontrada.", 404, "NOT_FOUND");
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const phone = input.phone.trim();

  if (!firstName || !lastName) {
    throw new ApiError("Nombre y apellido son obligatorios.", 400, "INVALID_INPUT");
  }

  if (!phone) {
    throw new ApiError("El teléfono de contacto es obligatorio.", 400, "INVALID_INPUT");
  }

  const { formatRut, isValidRut, rutMatches } = await import("@/lib/auth/rut");

  if (!isValidRut(input.rut)) {
    throw new ApiError("El RUT no es válido.", 400, "INVALID_RUT");
  }

  const formattedRut = formatRut(input.rut);

  if (!rutMatches(account.rut, formattedRut)) {
    throw new ApiError("El RUT no coincide con el registrado en tu invitación.", 400, "RUT_MISMATCH");
  }

  const updated = await prisma.staffAccount.update({
    where: { id: accountId },
    data: {
      fullName,
      phone,
      rut: formattedRut,
      onboardingCompleted: true,
    },
  });

  await issueSession({
    accountId: updated.id,
    email: updated.email,
    realm: "executive",
    mustChangePassword: false,
  });

  return mapExecutiveSessionUser(updated);
}

export async function changeStaffPassword(
  realm: StaffRealm,
  accountId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AdminSessionUser | ExecutiveSessionUser> {
  const strengthError = validatePasswordStrength(newPassword);
  if (strengthError) {
    throw new ApiError(strengthError, 400, "WEAK_PASSWORD");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(
      "La nueva contraseña debe ser distinta a la actual.",
      400,
      "SAME_PASSWORD",
    );
  }

  const account = await assertStaffRealm(accountId, realm);

  const passwordValid = await verifyPassword(
    currentPassword,
    account.passwordHash,
  );

  if (!passwordValid) {
    throw new ApiError("La contraseña actual no es correcta.", 401, "INVALID_PASSWORD");
  }

  if (isExecutiveRole(account.role)) {
    const subscriptionStatus = account.subscriptionStatus ?? "TRIAL";
    const subscriptionActive = isSubscriptionActive({
      subscriptionStatus,
      subscriptionExpiresAt: account.subscriptionExpiresAt,
    });

    if (!subscriptionActive) {
      throw new ApiError("Tu suscripción no está activa.", 403, "SUBSCRIPTION_INACTIVE");
    }
  }

  const passwordHash = await hashPassword(newPassword);
  const updated = await prisma.staffAccount.update({
    where: { id: accountId },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await issueSession({
    accountId: updated.id,
    email: updated.email,
    realm,
    mustChangePassword: false,
  });

  return isAdminRole(updated.role)
    ? mapAdminSessionUser(updated)
    : mapExecutiveSessionUser(updated);
}

export async function seedAuthAccountPassword(
  password: string,
): Promise<string> {
  return hashPassword(password);
}
