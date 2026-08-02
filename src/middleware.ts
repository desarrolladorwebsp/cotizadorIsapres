import { NextResponse, type NextRequest } from "next/server";
import {
  AGENT_QUERY_PARAM,
  PARTNER_ENTITY_QUERY_PARAM,
  RESERVED_ROOT_SEGMENTS,
} from "@/lib/partner-entity/constants";
import {
  isValidAgentKeySegment,
  resolveEngineAppBaseUrl,
} from "@/lib/platform/routing";
import { forwardRequest } from "@/lib/embed/middleware-embed";

const PARTNER_SLUG_PATTERN = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/;

function readAgentKeyFromSearchParams(request: NextRequest): string | null {
  const agent =
    request.nextUrl.searchParams.get(AGENT_QUERY_PARAM)?.trim().toLowerCase() ??
    request.nextUrl.searchParams
      .get(PARTNER_ENTITY_QUERY_PARAM)
      ?.trim()
      .toLowerCase();

  if (!agent || !isValidAgentKeySegment(agent)) {
    return null;
  }

  return agent;
}

function engineOrigin(): string {
  return resolveEngineAppBaseUrl();
}

/** `/` con `?agent=` → motor en isaprespremium.cl. */
function redirectRootWithAgentToEngine(
  request: NextRequest,
  agent: string,
): NextResponse {
  const redirectUrl = new URL("/cotizador", engineOrigin());
  redirectUrl.search = request.nextUrl.search;
  redirectUrl.searchParams.set(AGENT_QUERY_PARAM, agent);
  redirectUrl.searchParams.delete(PARTNER_ENTITY_QUERY_PARAM);
  return NextResponse.redirect(redirectUrl, 308);
}

function redirectPathToEngine(request: NextRequest): NextResponse {
  const redirectUrl = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    engineOrigin(),
  );
  return NextResponse.redirect(redirectUrl, 308);
}

/**
 * Landing-only middleware (cotizadorpremium.cl):
 * - `/` sirve la landing
 * - Motor, APIs, embed, isapres → 308 a isaprespremium.cl
 * - `/:partnerSlug` → motor con ese agent
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const agent = readAgentKeyFromSearchParams(request);
    if (agent) {
      return redirectRootWithAgentToEngine(request, agent);
    }
    return forwardRequest(request);
  }

  if (
    pathname === "/cotizador" ||
    pathname.startsWith("/cotizador/") ||
    pathname === "/embed" ||
    pathname.startsWith("/embed/") ||
    pathname === "/isapres" ||
    pathname.startsWith("/isapres/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/cotizador-widget.js" ||
    pathname === "/cotizador-widget.js.map"
  ) {
    return redirectPathToEngine(request);
  }

  const partnerMatch = pathname.match(PARTNER_SLUG_PATTERN);
  if (partnerMatch) {
    const slug = partnerMatch[1];
    if (!RESERVED_ROOT_SEGMENTS.has(slug)) {
      const redirectUrl = new URL("/cotizador", engineOrigin());
      redirectUrl.search = request.nextUrl.search;
      redirectUrl.searchParams.set(AGENT_QUERY_PARAM, slug);
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  return forwardRequest(request);
}

export const config = {
  matcher: [
    "/",
    "/cotizador",
    "/cotizador/:path*",
    "/embed",
    "/embed/:path*",
    "/isapres",
    "/isapres/:path*",
    "/api",
    "/api/:path*",
    "/cotizador-widget.js",
    "/cotizador-widget.js.map",
    "/:partnerSlug",
  ],
};
