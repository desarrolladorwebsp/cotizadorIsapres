import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REALM, SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";
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

async function hasValidSession(
  request: NextRequest,
  realm: typeof AUTH_REALM.admin | typeof AUTH_REALM.executive,
): Promise<boolean> {
  const cookieName =
    realm === AUTH_REALM.admin
      ? SESSION_COOKIE.admin
      : SESSION_COOKIE.executive;
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return false;

  const session = await verifySessionToken(token);
  return Boolean(session && session.realm === realm);
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
      const redirect = NextResponse.redirect(new URL(`/${entidad}`, request.url));
      return setPartnerEntityCookie(redirect, entidad);
    }

    const response = NextResponse.next();
    if (!request.cookies.get(PARTNER_ENTITY_COOKIE)?.value) {
      setPartnerEntityCookie(response, DEFAULT_PARTNER_ENTITY_SLUG);
    }
    return response;
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    const isLoginPage = pathname === ADMIN_LOGIN;

    if (isLoginPage) {
      if (await hasValidSession(request, AUTH_REALM.admin)) {
        return NextResponse.redirect(new URL(ADMIN_PREFIX, request.url));
      }
      return NextResponse.next();
    }

    if (!(await hasValidSession(request, AUTH_REALM.admin))) {
      const loginUrl = new URL(ADMIN_LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith(EXECUTIVE_PREFIX)) {
    const isLoginPage = pathname === EXECUTIVE_LOGIN;

    if (isLoginPage) {
      if (await hasValidSession(request, AUTH_REALM.executive)) {
        return NextResponse.redirect(new URL(EXECUTIVE_PREFIX, request.url));
      }
      return NextResponse.next();
    }

    if (!(await hasValidSession(request, AUTH_REALM.executive))) {
      const loginUrl = new URL(EXECUTIVE_LOGIN, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
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
