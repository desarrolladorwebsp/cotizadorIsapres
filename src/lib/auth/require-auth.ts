import { NextResponse } from "next/server";
import { AUTH_REALM, type AuthRealm } from "@/lib/auth/constants";
import {
  readSessionFromCookies,
  readSessionFromRequest,
} from "@/lib/auth/session";
import {
  readAdminById,
  readExecutiveById,
} from "@/lib/auth/account-store";
import type {
  AdminSessionUser,
  ExecutiveSessionUser,
  SessionPayload,
} from "@/lib/auth/types";
import { ApiError } from "@/lib/api/api-error";

export async function requireAdminSession(
  request?: Request,
): Promise<{ session: SessionPayload; user: AdminSessionUser }> {
  const session = request
    ? await readSessionFromRequest(request, AUTH_REALM.admin)
    : await readSessionFromCookies(AUTH_REALM.admin);

  if (!session) {
    throw new ApiError("Sesión de administrador requerida.", 401, "UNAUTHORIZED");
  }

  const user = await readAdminById(session.sub);
  if (!user) {
    throw new ApiError("Sesión de administrador inválida.", 401, "UNAUTHORIZED");
  }

  return { session, user };
}

export async function requireExecutiveSession(
  request?: Request,
): Promise<{ session: SessionPayload; user: ExecutiveSessionUser }> {
  const session = request
    ? await readSessionFromRequest(request, AUTH_REALM.executive)
    : await readSessionFromCookies(AUTH_REALM.executive);

  if (!session) {
    throw new ApiError("Sesión de ejecutivo requerida.", 401, "UNAUTHORIZED");
  }

  const user = await readExecutiveById(session.sub);
  if (!user) {
    throw new ApiError("Sesión de ejecutivo inválida.", 401, "UNAUTHORIZED");
  }

  if (!user.subscriptionActive) {
    throw new ApiError(
      "Tu suscripción no está activa.",
      403,
      "SUBSCRIPTION_INACTIVE",
    );
  }

  return { session, user };
}

export async function requireStaffSession(
  request?: Request,
): Promise<
  | { realm: typeof AUTH_REALM.admin; user: AdminSessionUser }
  | { realm: typeof AUTH_REALM.executive; user: ExecutiveSessionUser }
> {
  try {
    const admin = await requireAdminSession(request);
    return { realm: AUTH_REALM.admin, user: admin.user };
  } catch {
    const executive = await requireExecutiveSession(request);
    return { realm: AUTH_REALM.executive, user: executive.user };
  }
}

export function unauthorizedResponse(realm: AuthRealm): NextResponse {
  return NextResponse.json(
    { error: "No autorizado.", code: "UNAUTHORIZED" },
    { status: 401 },
  );
}
