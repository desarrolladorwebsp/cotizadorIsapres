import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_CHANGE_PASSWORD_PATH,
  AUTH_REALM,
  EXECUTIVE_CHANGE_PASSWORD_PATH,
  SESSION_COOKIE,
} from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/lib/auth/types";
import {
  DEFAULT_PARTNER_ENTITY_SLUG,
  PARTNER_ENTITY_COOKIE,
  PARTNER_ENTITY_COOKIE_MAX_AGE,
  PARTNER_ENTITY_QUERY_PARAM,
  RESERVED_ROOT_SEGMENTS,
} from "@/lib/partner-entity/constants";

const ADMIN_PREFIX = "/cotizador/admin";
const EXECUTIVE_PREFIX = "/cotizador/ejecutivos";
const ADMIN_LOGIN = `${ADMIN_PREFIX}/login`;
const EXECUTIVE_LOGIN = `${EXECUTIVE_PREFIX}/login`;

const PARTNER_SLUG_PATTERN = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

async function readStaffSession(
  request: NextRequest,
  realm: typeof AUTH_REALM.admin | typeof AUTH_REALM.executive,
): Promise<SessionPayload | null> {
  const cookieName =
    realm === AUTH_REALM.admin
      ? SESSION_COOKIE.admin
      : SESSION_COOKIE.executive;
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session || session.realm !== realm) return null;

  return session;
}

function setPartnerEntityCookie(
  response: NextResponse,
  slug: string,
): NextResponse {
  response.cookies.set(PARTNER_ENTITY_COOKIE, slug.trim().toLowerCase(), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: PARTNER_ENTITY_COOKIE_MAX_AGE,
  });

  return response;
}

function applyPartnerCookieFromPath(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const match = request.nextUrl.pathname.match(PARTNER_SLUG_PATTERN);
  if (!match) return response;

  const slug = match[1];
  if (RESERVED_ROOT_SEGMENTS.has(slug)) return response;

  return setPartnerEntityCookie(response, slug);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname === "/cotizador") {
    const entidad = request.nextUrl.searchParams
      .get(PARTNER_ENTITY_QUERY_PARAM)
      ?.trim()
      .toLowerCase();

    if (entidad && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entidad)) {
      const redirectUrl = new URL(`/${entidad}`, request.url);
      redirectUrl.search = request.nextUrl.search;
      redirectUrl.searchParams.delete(PARTNER_ENTITY_QUERY_PARAM);
      const redirect = NextResponse.redirect(redirectUrl);
      return setPartnerEntityCookie(redirect, entidad);
    }

    const response = NextResponse.next();
    if (!request.cookies.get(PARTNER_ENTITY_COOKIE)?.value) {
      setPartnerEntityCookie(response, DEFAULT_PARTNER_ENTITY_SLUG);
    }
    return response;
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    const session = await readStaffSession(request, AUTH_REALM.admin);
    const isLoginPage = pathname === ADMIN_LOGIN;
    const isChangePasswordPage = pathname === ADMIN_CHANGE_PASSWORD_PATH;

    if (isLoginPage) {
      if (session) {
        const target = session.mustChangePassword
          ? ADMIN_CHANGE_PASSWORD_PATH
          : ADMIN_PREFIX;
        return NextResponse.redirect(new URL(target, request.url));
      }
      return NextResponse.next();
    }

    if (isChangePasswordPage) {
      if (!session) {
        const loginUrl = new URL(ADMIN_LOGIN, request.url);
        loginUrl.searchParams.set("next", ADMIN_CHANGE_PASSWORD_PATH);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.mustChangePassword) {
      return NextResponse.redirect(
        new URL(ADMIN_CHANGE_PASSWORD_PATH, request.url),
      );
    }

    return NextResponse.next();
  }

  if (pathname.startsWith(EXECUTIVE_PREFIX)) {
    const session = await readStaffSession(request, AUTH_REALM.executive);
    const isLoginPage = pathname === EXECUTIVE_LOGIN;
    const isChangePasswordPage = pathname === EXECUTIVE_CHANGE_PASSWORD_PATH;

    if (isLoginPage) {
      if (session) {
        const target = session.mustChangePassword
          ? EXECUTIVE_CHANGE_PASSWORD_PATH
          : EXECUTIVE_PREFIX;
        return NextResponse.redirect(new URL(target, request.url));
      }
      return NextResponse.next();
    }

    if (isChangePasswordPage) {
      if (!session) {
        const loginUrl = new URL(EXECUTIVE_LOGIN, request.url);
        loginUrl.searchParams.set("next", EXECUTIVE_CHANGE_PASSWORD_PATH);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = new URL(EXECUTIVE_LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.mustChangePassword) {
      return NextResponse.redirect(
        new URL(EXECUTIVE_CHANGE_PASSWORD_PATH, request.url),
      );
    }

    return NextResponse.next();
  }

  const response = NextResponse.next();
  return applyPartnerCookieFromPath(request, response);
}

export const config = {
  matcher: [
    "/",
    "/cotizador",
    "/:partnerSlug",
    "/cotizador/admin/:path*",
    "/cotizador/ejecutivos/:path*",
  ],
};
