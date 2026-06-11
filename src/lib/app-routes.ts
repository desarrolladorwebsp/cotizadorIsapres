export const COTIZADOR_HOME = "/cotizador";

/** Rutas de página conocidas (sin barra final). */
export const KNOWN_PAGE_ROUTES = new Set([
  COTIZADOR_HOME,
  `${COTIZADOR_HOME}/ejecutivos`,
  `${COTIZADOR_HOME}/admin`,
]);

export function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isStaticAssetPath(pathname: string): boolean {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/** true → redirigir a /cotizador */
export function shouldRedirectToCotizador(pathname: string): boolean {
  const path = normalizePathname(pathname);

  if (path === "/") return true;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  if (path.startsWith("/images")) return false;
  if (isStaticAssetPath(path)) return false;
  if (KNOWN_PAGE_ROUTES.has(path)) return false;

  return true;
}
