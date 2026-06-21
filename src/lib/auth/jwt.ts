import { SignJWT, jwtVerify } from "jose";
import {
  AUTH_REALM,
  SESSION_MAX_AGE_SECONDS,
  type AuthRealm,
} from "@/lib/auth/constants";
import type { SessionPayload } from "@/lib/auth/types";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET debe estar definido y tener al menos 32 caracteres.",
      );
    }

    return new TextEncoder().encode(
      "dev-only-auth-secret-change-before-production!!",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(input: {
  accountId: string;
  email: string;
  realm: AuthRealm;
  mustChangePassword?: boolean;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    email: input.email,
    realm: input.realm,
    mustChangePassword: Boolean(input.mustChangePassword),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.accountId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE_SECONDS)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
    });

    const realm = payload.realm;
    if (realm !== AUTH_REALM.admin && realm !== AUTH_REALM.executive) {
      return null;
    }

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      realm,
      mustChangePassword: payload.mustChangePassword === true,
      iat: payload.iat ?? 0,
      exp: payload.exp ?? 0,
    };
  } catch {
    return null;
  }
}
