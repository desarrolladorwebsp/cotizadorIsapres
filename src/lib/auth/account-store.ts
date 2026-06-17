import { prisma } from "@/lib/prisma";
import {
  LOGIN_LOCKOUT,
  type AuthRealm,
} from "@/lib/auth/constants";
import { hashPassword, normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { issueSession } from "@/lib/auth/session";
import {
  getSubscriptionBlockReason,
  isSubscriptionActive,
} from "@/lib/auth/subscription";
import type {
  AdminSessionUser,
  ExecutiveSessionUser,
  LoginCredentials,
} from "@/lib/auth/types";
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
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
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
  });

  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    phone: account.phone,
    subscriptionStatus: account.subscriptionStatus,
    subscriptionExpiresAt: account.subscriptionExpiresAt?.toISOString() ?? null,
    subscriptionActive,
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
  };
}

export async function seedAuthAccountPassword(
  password: string,
): Promise<string> {
  return hashPassword(password);
}
