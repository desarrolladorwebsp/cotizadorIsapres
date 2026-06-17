import { NextResponse, type NextRequest } from "next/server";
import { AUTH_REALM, SESSION_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";

const ADMIN_PREFIX = "/cotizador/admin";
const EXECUTIVE_PREFIX = "/cotizador/ejecutivos";
const ADMIN_LOGIN = `${ADMIN_PREFIX}/login`;
const EXECUTIVE_LOGIN = `${EXECUTIVE_PREFIX}/login`;

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/cotizador/admin/:path*", "/cotizador/ejecutivos/:path*"],
};
