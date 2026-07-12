import { NextResponse } from "next/server";
import { FALLBACK_PARTNER_ENTITIES } from "@/lib/partner-entity/fallback-entities";
import {
  DEV_APP_BASE_URL,
  PROD_APP_BASE_URL,
  resolveAppBaseUrl,
} from "@/lib/platform/routing";
import { checkRateLimit, readClientIp } from "@/lib/security/rate-limit";

const MAX_PUBLIC_POST_BYTES = 48_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const PUBLIC_POST_PROFILES = {
  quote: { limit: 15, label: "cotizaciones" },
  "cotizacion-notify": { limit: 20, label: "notificaciones" },
  "company-agreement": { limit: 10, label: "consultas de convenio" },
} as const;

export type PublicPostProfile = keyof typeof PUBLIC_POST_PROFILES;

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function collectAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  for (const base of [
    resolveAppBaseUrl(),
    PROD_APP_BASE_URL,
    DEV_APP_BASE_URL,
    process.env.APP_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]) {
    if (!base?.trim()) continue;
    const normalized = normalizeOrigin(base.trim());
    if (normalized) origins.add(normalized);
  }

  for (const partner of Object.values(FALLBACK_PARTNER_ENTITIES)) {
    const normalized = normalizeOrigin(partner.websiteUrl);
    if (normalized) origins.add(normalized);
  }

  if (process.env.NODE_ENV === "development") {
    for (const host of [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]) {
      origins.add(host);
    }
  }

  const extra = process.env.ALLOWED_PUBLIC_ORIGINS?.trim();
  if (extra) {
    for (const item of extra.split(/[\s,]+/)) {
      const normalized = normalizeOrigin(item);
      if (normalized) origins.add(normalized);
    }
  }

  return origins;
}

const ALLOWED_PUBLIC_ORIGINS = collectAllowedOrigins();

function readRequestOrigin(request: Request): string | null {
  const origin = request.headers.get("origin")?.trim();
  if (origin) return normalizeOrigin(origin);

  const referer = request.headers.get("referer")?.trim();
  if (!referer) return null;

  return normalizeOrigin(referer);
}

function isAllowedOrigin(request: Request): boolean {
  const origin = readRequestOrigin(request);
  if (!origin) return true;
  return ALLOWED_PUBLIC_ORIGINS.has(origin);
}

function readContentLength(request: Request): number | null {
  const raw = request.headers.get("content-length")?.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function enforcePublicPostGuard(
  request: Request,
  profile: PublicPostProfile,
): Response | null {
  const contentLength = readContentLength(request);
  if (contentLength !== null && contentLength > MAX_PUBLIC_POST_BYTES) {
    return NextResponse.json(
      { error: "La solicitud supera el tamaño permitido." },
      { status: 413 },
    );
  }

  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Origen no autorizado para esta operación." },
      { status: 403 },
    );
  }

  const ip = readClientIp(request);
  const { limit, label } = PUBLIC_POST_PROFILES[profile];
  const rate = checkRateLimit(`${profile}:${ip}`, {
    limit,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Demasiadas ${label}. Intenta nuevamente en unos minutos.`,
        retryAfterSeconds: rate.retryAfterSeconds,
      },
      {
        status: 429,
        headers: rate.retryAfterSeconds
          ? { "Retry-After": String(rate.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  return null;
}
