import type { PartnerEntityPublic, PartnerEntityTheme } from "@/types/partner-entity";
import {
  COTIZADOR_PREMIUM_LOGO_PATH,
  COTIZADOR_PREMIUM_PALETTE,
} from "@/lib/partner-entity/cotizador-premium-palette";

/** Agent key / slug de la plataforma principal (cotizadorpremium.cl). */
export const PLATFORM_AGENT_KEY = "cotizadorpremium";

export const PLATFORM_AGENT_WEBSITE = "https://cotizadorpremium.cl";

export const PLATFORM_AGENT_LOGO_URL = COTIZADOR_PREMIUM_LOGO_PATH;

/**
 * Tema de marca Cotizador Premium — paleta del logo oficial (navy + cyan/azul).
 * Fuente de verdad en código para seed/fallback; en producción se persiste en
 * `partner_entities.theme` y puede editarse sin redeploy.
 */
export const COTIZADOR_PREMIUM_THEME: PartnerEntityTheme = {
  primary: COTIZADOR_PREMIUM_PALETTE.primary,
  primaryHover: COTIZADOR_PREMIUM_PALETTE.primaryHover,
  primaryDark: COTIZADOR_PREMIUM_PALETTE.primaryDark,
  primaryForeground: COTIZADOR_PREMIUM_PALETTE.primaryForeground,
  secondary: COTIZADOR_PREMIUM_PALETTE.secondary,
  secondaryMuted: COTIZADOR_PREMIUM_PALETTE.secondaryMuted,
  bgLayout: COTIZADOR_PREMIUM_PALETTE.bgLayout,
  foreground: COTIZADOR_PREMIUM_PALETTE.foreground,
  muted: COTIZADOR_PREMIUM_PALETTE.muted,
  border: COTIZADOR_PREMIUM_PALETTE.border,
  surfaceHover: COTIZADOR_PREMIUM_PALETTE.surfaceHover,
  criteriaSurface: COTIZADOR_PREMIUM_PALETTE.criteriaSurface,
  criteriaRing: COTIZADOR_PREMIUM_PALETTE.criteriaRing,
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
