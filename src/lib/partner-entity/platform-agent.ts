import type { PartnerEntityPublic, PartnerEntityTheme } from "@/types/partner-entity";

/** Agent key / slug de la plataforma principal (cotizadorpremium.cl). */
export const PLATFORM_AGENT_KEY = "cotizadorpremium";

export const PLATFORM_AGENT_WEBSITE = "https://cotizadorpremium.cl";

/** Logo provisional hasta que exista el asset final. */
export const PLATFORM_AGENT_LOGO_URL =
  "/images/partners/cotizadorpremium-logo.svg";

/**
 * Tema de marca Cotizador Premium (propuesta 5 — púrpura / índigo).
 * Fuente de verdad en código para seed/fallback; en producción se persiste en
 * `partner_entities.theme` y puede editarse sin redeploy.
 */
export const COTIZADOR_PREMIUM_THEME: PartnerEntityTheme = {
  primary: "#6d28d9",
  primaryHover: "#5b21b6",
  primaryDark: "#111827",
  primaryForeground: "#ffffff",
  secondary: "#4f46e5",
  secondaryMuted: "#f5f3ff",
  bgLayout: "#fafafa",
  foreground: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surfaceHover: "#f5f3ff",
  criteriaSurface: "#f5f3ff",
  criteriaRing: "#e9e5ff",
};

export function buildCotizadorPremiumPartnerRecord(): Omit<
  PartnerEntityPublic,
  never
> {
  return {
    slug: PLATFORM_AGENT_KEY,
    embedKey: PLATFORM_AGENT_KEY,
    name: "Cotizador Premium",
    logoUrl: PLATFORM_AGENT_LOGO_URL,
    websiteUrl: PLATFORM_AGENT_WEBSITE,
    whatsappNumber: "56964133848",
    whatsappMessage:
      "Hola, quiero cotizar un plan de salud con Cotizador Premium",
    exitLabel: "Volver a Cotizador Premium",
    brandKey: "premium",
    theme: COTIZADOR_PREMIUM_THEME,
  };
}

export function buildCotizadorPremiumCotizadorUrl(
  basePath = "/cotizador",
): string {
  return `${basePath}?agent=${PLATFORM_AGENT_KEY}`;
}
