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
import type { SubscriptionStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/api-error";

const GENERIC_LOGIN_ERROR = "Correo o contraseña incorrectos.";

function mapExecutiveSessionUser(account: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  rut: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date | null;
  mustChangePassword: boolean;
  onboardingCompleted: boolean;
  assignmentsSuspended: boolean;
}): ExecutiveSessionUser {
  const subscriptionActive = isSubscriptionActive({
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt,
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    phone: account.phone,
    rut: account.rut,
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
    mustChangePassword: account.mustChangePassword,
    onboardingCompleted: account.onboardingCompleted,
    assignmentsSuspended: account.assignmentsSuspended,
  };
}

function mapExecutiveStaffRecord(account: {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  phone: string | null;
  rut: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt: Date | null;
  assignmentsSuspended: boolean;
  onboardingCompleted: boolean;
}): StaffAccountRecord {
  return {
    id: account.id,
    realm: "executive",
    email: account.email,
    fullName: account.fullName,
    active: account.active,
    mustChangePassword: account.mustChangePassword,
    lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
    phone: account.phone,
    rut: account.rut,
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    assignmentsSuspended: account.assignmentsSuspended,
    onboardingCompleted: account.onboardingCompleted,
  };
}

function isAccountLocked(lockedUntil: Date | null): boolean {
  return Boolean(lockedUntil && lockedUntil.getTime() > Date.now());
}

async function registerFailedLogin(
  realm: AuthRealm,
  accountId: string,
  failedAttempts: number,
): Promise<void> {
  const nextAttempts = failedAttempts + 1;
  const shouldLock = nextAttempts >= LOGIN_LOCKOUT.maxAttempts;
  const lockedUntil = shouldLock
    ? new Date(Date.now() + LOGIN_LOCKOUT.lockMinutes * 60 * 1000)
    : null;

  if (realm === "admin") {
    await prisma.adminAccount.update({
      where: { id: accountId },
      data: {
        failedLoginAttempts: nextAttempts,
        lockedUntil,
      },
    });
    return;
  }

  await prisma.executiveAccount.update({
    where: { id: accountId },
    data: {
      failedLoginAttempts: nextAttempts,
      lockedUntil,
    },
  });
}

async function registerSuccessfulLogin(
  realm: AuthRealm,
  accountId: string,
): Promise<void> {
  const data = {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
  };

  if (realm === "admin") {
    await prisma.adminAccount.update({ where: { id: accountId }, data });
    return;
  }

  await prisma.executiveAccount.update({ where: { id: accountId }, data });
}

export async function authenticateAdmin(
  credentials: LoginCredentials,
): Promise<AdminSessionUser> {
  const email = normalizeEmail(credentials.email);
  const account = await prisma.adminAccount.findUnique({ where: { email } });

  if (!account || !account.active) {
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
    await registerFailedLogin("admin", account.id, account.failedLoginAttempts);
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  await registerSuccessfulLogin("admin", account.id);
  await issueSession({
    accountId: account.id,
    email: account.email,
    realm: "admin",
    mustChangePassword: account.mustChangePassword,
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    mustChangePassword: account.mustChangePassword,
  };
}

export async function authenticateExecutive(
  credentials: LoginCredentials,
): Promise<ExecutiveSessionUser> {
  const email = normalizeEmail(credentials.email);
  const account = await prisma.executiveAccount.findUnique({ where: { email } });

  if (!account || !account.active) {
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
    await registerFailedLogin(
      "executive",
      account.id,
      account.failedLoginAttempts,
    );
    throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
  }

  const subscriptionActive = isSubscriptionActive({
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt,
  });

  if (!subscriptionActive) {
    const reason = getSubscriptionBlockReason({
      subscriptionStatus: account.subscriptionStatus,
      subscriptionExpiresAt: account.subscriptionExpiresAt,
    });

    throw new ApiError(
      reason ?? "Suscripción inactiva.",
      403,
      "SUBSCRIPTION_INACTIVE",
    );
  }

  await registerSuccessfulLogin("executive", account.id);
  await issueSession({
    accountId: account.id,
    email: account.email,
    realm: "executive",
    mustChangePassword: account.mustChangePassword,
  });

  return mapExecutiveSessionUser(account);
}

export async function authenticateStaff(
  credentials: LoginCredentials,
): Promise<{
  realm: AuthRealm;
  user: AdminSessionUser | ExecutiveSessionUser;
}> {
  const email = normalizeEmail(credentials.email);
  const admin = await prisma.adminAccount.findUnique({ where: { email } });

  if (admin) {
    return {
      realm: "admin",
      user: await authenticateAdmin(credentials),
    };
  }

  const executive = await prisma.executiveAccount.findUnique({ where: { email } });

  if (executive) {
    return {
      realm: "executive",
      user: await authenticateExecutive(credentials),
    };
  }

  throw new ApiError(GENERIC_LOGIN_ERROR, 401, "INVALID_CREDENTIALS");
}

export async function readAdminById(
  id: string,
): Promise<AdminSessionUser | null> {
  const account = await prisma.adminAccount.findUnique({ where: { id } });

  if (!account || !account.active) return null;

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    mustChangePassword: account.mustChangePassword,
  };
}

export async function readAdminByEmail(
  email: string,
): Promise<AdminSessionUser | null> {
  const account = await prisma.adminAccount.findUnique({
    where: { email: normalizeEmail(email) },
  });

  if (!account || !account.active) return null;

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    mustChangePassword: account.mustChangePassword,
  };
}

export async function readExecutiveById(
  id: string,
): Promise<ExecutiveSessionUser | null> {
  const account = await prisma.executiveAccount.findUnique({ where: { id } });

  if (!account || !account.active) return null;

  return mapExecutiveSessionUser(account);
}

export async function listStaffAccounts(): Promise<StaffAccountRecord[]> {
  const [admins, executives] = await Promise.all([
    prisma.adminAccount.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.executiveAccount.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const adminRecords: StaffAccountRecord[] = admins.map((account) => ({
    id: account.id,
    realm: "admin",
    email: account.email,
    fullName: account.fullName,
    active: account.active,
    mustChangePassword: account.mustChangePassword,
    lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
    createdAt: account.createdAt.toISOString(),
  }));

  const executiveRecords: StaffAccountRecord[] = executives.map((account) =>
    mapExecutiveStaffRecord(account),
  );

  return [...adminRecords, ...executiveRecords]
    .filter((account) => account.realm === "admin" || account.realm === "executive")
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<{ account: StaffAccountRecord; temporaryPassword: string }> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName?.trim() || email.split("@")[0];
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  if (!fullName) {
    throw new ApiError("El nombre es obligatorio.", 400, "INVALID_INPUT");
  }

  const [existingAdmin, existingExecutive] = await Promise.all([
    prisma.adminAccount.findUnique({ where: { email } }),
    prisma.executiveAccount.findUnique({ where: { email } }),
  ]);

  if (existingAdmin || existingExecutive) {
    throw new ApiError("Ya existe una cuenta con ese correo.", 409, "EMAIL_EXISTS");
  }

  if (input.realm === "admin") {
    const account = await prisma.adminAccount.create({
      data: {
        email,
        fullName,
        passwordHash,
        active: true,
        mustChangePassword: true,
      },
    });

    return {
      temporaryPassword,
      account: {
        id: account.id,
        realm: "admin",
        email: account.email,
        fullName: account.fullName,
        active: account.active,
        mustChangePassword: account.mustChangePassword,
        lastLoginAt: null,
        createdAt: account.createdAt.toISOString(),
      },
    };
  }

  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
  const subscriptionStatus: SubscriptionStatus =
    input.subscriptionStatus ?? "TRIAL";

  const account = await prisma.executiveAccount.create({
    data: {
      email,
      fullName,
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

  return {
    temporaryPassword,
    account: {
      id: account.id,
      realm: "executive",
      email: account.email,
      fullName: account.fullName,
      active: account.active,
      mustChangePassword: account.mustChangePassword,
      lastLoginAt: null,
      createdAt: account.createdAt.toISOString(),
      phone: account.phone,
      rut: account.rut,
      subscriptionStatus: account.subscriptionStatus,
      subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    },
  };
}

export async function updateStaffAccount(
  realm: StaffRealm,
  id: string,
  input: UpdateStaffAccountInput,
): Promise<StaffAccountRecord> {
  if (realm === "admin") {
    const account = await prisma.adminAccount.update({
      where: { id },
      data: {
        active: input.active,
        fullName: input.fullName?.trim(),
      },
    });

    return {
      id: account.id,
      realm: "admin",
      email: account.email,
      fullName: account.fullName,
      active: account.active,
      mustChangePassword: account.mustChangePassword,
      lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
    };
  }

  const account = await prisma.executiveAccount.update({
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

  return mapExecutiveStaffRecord(account);
}

export async function resetStaffTemporaryPassword(
  realm: StaffRealm,
  id: string,
): Promise<{ account: StaffAccountRecord; temporaryPassword: string }> {
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  if (realm === "admin") {
    const account = await prisma.adminAccount.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt: new Date(),
      },
    });

    return {
      temporaryPassword,
      account: {
        id: account.id,
        realm: "admin",
        email: account.email,
        fullName: account.fullName,
        active: account.active,
        mustChangePassword: account.mustChangePassword,
        lastLoginAt: account.lastLoginAt?.toISOString() ?? null,
        createdAt: account.createdAt.toISOString(),
      },
    };
  }

  const account = await prisma.executiveAccount.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
    },
  });

  return {
    temporaryPassword,
    account: mapExecutiveStaffRecord(account),
  };
}

export async function deleteStaffAccount(
  realm: StaffRealm,
  id: string,
): Promise<void> {
  if (realm === "admin") {
    const account = await prisma.adminAccount.findUnique({ where: { id } });
    if (!account) {
      throw new ApiError("Usuario no encontrado.", 404, "NOT_FOUND");
    }
    await prisma.adminAccount.delete({ where: { id } });
    return;
  }

  const account = await prisma.executiveAccount.findUnique({ where: { id } });
  if (!account) {
    throw new ApiError("Usuario no encontrado.", 404, "NOT_FOUND");
  }

  await prisma.executiveAccount.delete({ where: { id } });
}

export async function completeExecutiveOnboarding(
  accountId: string,
  input: { firstName: string; lastName: string; phone: string; rut: string },
): Promise<ExecutiveSessionUser> {
  const account = await prisma.executiveAccount.findUnique({
    where: { id: accountId },
  });

  if (!account || !account.active) {
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

  const updated = await prisma.executiveAccount.update({
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

  if (realm === "admin") {
    const account = await prisma.adminAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.active) {
      throw new ApiError("Cuenta no encontrada.", 404, "NOT_FOUND");
    }

    const passwordValid = await verifyPassword(
      currentPassword,
      account.passwordHash,
    );

    if (!passwordValid) {
      throw new ApiError("La contraseña actual no es correcta.", 401, "INVALID_PASSWORD");
    }

    const passwordHash = await hashPassword(newPassword);
    const updated = await prisma.adminAccount.update({
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
      realm: "admin",
      mustChangePassword: false,
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      mustChangePassword: false,
    };
  }

  const account = await prisma.executiveAccount.findUnique({
    where: { id: accountId },
  });

  if (!account || !account.active) {
    throw new ApiError("Cuenta no encontrada.", 404, "NOT_FOUND");
  }

  const passwordValid = await verifyPassword(
    currentPassword,
    account.passwordHash,
  );

  if (!passwordValid) {
    throw new ApiError("La contraseña actual no es correcta.", 401, "INVALID_PASSWORD");
  }

  const subscriptionActive = isSubscriptionActive({
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt,
  });

  if (!subscriptionActive) {
    throw new ApiError("Tu suscripción no está activa.", 403, "SUBSCRIPTION_INACTIVE");
  }

  const passwordHash = await hashPassword(newPassword);
  const updated = await prisma.executiveAccount.update({
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
    realm: "executive",
    mustChangePassword: false,
  });

  return mapExecutiveSessionUser(updated);
}

export async function seedAuthAccountPassword(
  password: string,
): Promise<string> {
  return hashPassword(password);
}
