import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COTIZADOR_HOME,
  normalizePathname,
  shouldRedirectToCotizador,
} from "@/lib/app-routes";

export function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  if (!shouldRedirectToCotizador(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = COTIZADOR_HOME;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
