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

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    phone: account.phone,
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
    mustChangePassword: account.mustChangePassword,
  };
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
export async function readExecutiveById(
  id: string,
): Promise<ExecutiveSessionUser | null> {
  const account = await prisma.executiveAccount.findUnique({ where: { id } });

  if (!account || !account.active) return null;

  const subscriptionActive = isSubscriptionActive({
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt,
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    phone: account.phone,
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
    mustChangePassword: account.mustChangePassword,
  };
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

  const executiveRecords: StaffAccountRecord[] = executives.map((account) => ({
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
  }));

  return [...adminRecords, ...executiveRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<{ account: StaffAccountRecord; temporaryPassword: string }> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
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
    },
  });

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
  };
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
    account: {
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
    },
  };
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

  return {
    id: updated.id,
    email: updated.email,
    fullName: updated.fullName,
    phone: updated.phone,
    subscriptionStatus: updated.subscriptionStatus,
    subscriptionExpiresAt: updated.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
    mustChangePassword: false,
  };
}

export async function seedAuthAccountPassword(
  password: string,
): Promise<string> {
  return hashPassword(password);
}
