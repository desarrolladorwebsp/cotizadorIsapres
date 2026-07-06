const PROD_APP_ORIGIN = "https://cotizadorpremium.cl";
const DEV_APP_ORIGIN = "http://localhost:3001";

/** Sitios aliados autorizados a embeber el cotizador por defecto. */
const DEFAULT_PARTNER_WEBSITES = [
  "https://cotizadorpremium.cl",
  "https://www.cotizadorpremium.cl",
  "https://cotizaloantes.cl",
  "https://www.cotizaloantes.cl",
  "https://desdetu7.cl",
  "https://www.desdetu7.cl",
  "https://isaprepremium.cl",
  "https://www.isaprepremium.cl",
] as const;

function normalizeFrameOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "'self'" || trimmed === "self") {
    return "'self'";
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    return url.origin;
  } catch {
    return null;
  }
}

function readConfiguredAppOrigin(): string | null {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim();

  if (!fromEnv) return null;
  return normalizeFrameOrigin(fromEnv);
}

function collectDefaultFrameAncestors(): string[] {
  const values = new Set<string>(["'self'"]);

  const configuredOrigin = readConfiguredAppOrigin();
  if (configuredOrigin && configuredOrigin !== "'self'") {
    values.add(configuredOrigin);
  }

  values.add(PROD_APP_ORIGIN);
  values.add("https://www.cotizadorpremium.cl");

  for (const website of DEFAULT_PARTNER_WEBSITES) {
    const origin = normalizeFrameOrigin(website);
    if (origin && origin !== "'self'") values.add(origin);
  }

  if (process.env.NODE_ENV === "development") {
    for (const origin of [
      DEV_APP_ORIGIN,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]) {
      values.add(origin);
    }
  }

  return [...values];
}

/**
 * Valor completo de la directiva CSP `frame-ancestors` para rutas embebibles.
 * - `EMBED_FRAME_ANCESTORS=*` → permite cualquier sitio (solo si se define explícitamente).
 * - `EMBED_FRAME_ANCESTORS=https://a.cl https://b.cl` → lista personalizada.
 * - Sin variable → socios conocidos + localhost en dev (más seguro que `*`).
 */
export function resolveEmbedFrameAncestorsDirective(): string {
  const configured = process.env.EMBED_FRAME_ANCESTORS?.trim();

  if (configured === "*") {
    return "frame-ancestors *";
  }

  if (configured) {
    return `frame-ancestors ${configured}`;
  }

  return `frame-ancestors ${collectDefaultFrameAncestors().join(" ")}`;
}
