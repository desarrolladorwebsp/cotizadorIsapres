import { cookies } from "next/headers";
import {
  AUTH_REALM,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  type AuthRealm,
} from "@/lib/auth/constants";
import { createSessionToken, verifySessionToken } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/lib/auth/types";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getSessionCookieName(realm: AuthRealm): string {
  return realm === AUTH_REALM.admin
    ? SESSION_COOKIE.admin
    : SESSION_COOKIE.executive;
}

export async function setSessionCookie(
  realm: AuthRealm,
  token: string,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(realm), token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(realm: AuthRealm): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(realm), "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSessionFromCookies(
  realm: AuthRealm,
): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName(realm))?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session || session.realm !== realm) return null;

  return session;
}

export function readSessionTokenFromRequest(
  request: Request,
  realm: AuthRealm,
): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookieName = getSessionCookieName(realm);
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function readSessionFromRequest(
  request: Request,
  realm: AuthRealm,
): Promise<SessionPayload | null> {
  const token = readSessionTokenFromRequest(request, realm);
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session || session.realm !== realm) return null;

  return session;
}

export async function issueSession(input: {
  accountId: string;
  email: string;
  realm: AuthRealm;
}): Promise<string> {
  const token = await createSessionToken(input);
  await setSessionCookie(input.realm, token);
  return token;
}
