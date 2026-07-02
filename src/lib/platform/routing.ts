/** Ruta canónica del cotizador completo (multitenant por ?agent=). */
export const PREMIUM_COTIZADOR_PATH = "/cotizador";

/** URL local de desarrollo (cotizador en :3001). */
export const DEV_APP_BASE_URL = "http://localhost:3001";

/** URL canónica de producción. */
export const PROD_APP_BASE_URL = "https://cotizadorpremium.cl";

/** @deprecated Usar resolveAppBaseUrl() */
export const DEFAULT_APP_BASE_URL = PROD_APP_BASE_URL;

/** Dominio legacy white-label (compatibilidad). */
export const LEGACY_APP_BASE_URL = "https://cotizador.cotizaloantes.cl";

export function resolveAppBaseUrl(override?: string): string {
  if (override?.trim()) {
    return override.replace(/\/$/, "");
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.APP_BASE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_COTIZADOR_URL?.replace(/\/$/, "");

  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "development") {
    return DEV_APP_BASE_URL;
  }

  return PROD_APP_BASE_URL;
}

/** true → URLs en /cotizador?agent= ; false → /{slug}?entidad= (legacy) */
export function usesPremiumRouting(baseUrl?: string): boolean {
  const mode = process.env.NEXT_PUBLIC_COTIZADOR_ROUTING?.trim().toLowerCase();
  if (mode === "legacy") return false;
  if (mode === "premium") return true;

  const base = resolveAppBaseUrl(baseUrl).toLowerCase();
  if (base.includes("cotizador.cotizaloantes")) return false;

  return true;
}

/** Valida slug o embed key (minúsculas, guiones). */
export function isValidAgentKeySegment(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized);
}
