/**
 * Paleta extraída del logo oficial Cotizador Premium.
 * Navy + gradiente cyan → azul del isotipo.
 */
export const COTIZADOR_PREMIUM_PALETTE = {
  /** Azul principal del arco del logo — CTAs y acentos */
  primary: "#0077B6",
  primaryHover: "#005F92",
  /** Navy del monograma y tipografía PREMIUM */
  primaryDark: "#0B2545",
  primaryForeground: "#FFFFFF",
  /** Cyan claro del gradiente del logo */
  secondary: "#48CAE4",
  secondaryMuted: "#E8F6FB",
  /** Gris del wordmark COTIZADOR */
  muted: "#8D99AE",
  textSecondary: "#6B8494",
  bgLayout: "#F8FBFD",
  background: "#FFFFFF",
  foreground: "#0B2545",
  border: "#D7E6EF",
  surfaceHover: "#EDF6FA",
  criteriaSurface: "#EDF6FA",
  criteriaRing: "#C5E4F2",
} as const;

export const COTIZADOR_PREMIUM_LOGO_PATH =
  "/images/logo-cotizador-premium.png";

/** Isotipo / icono oficial — solo favicon y marcas compactas (CEO header). */
export const COTIZADOR_PREMIUM_ICON_PATH =
  "/images/icono-logo-cotizador-premium.png";
