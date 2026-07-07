import type { PartnerEntityPublic, PartnerEntityTheme } from "@/types/partner-entity";

/** Agent key / slug oficial (dominio isaprespremium.cl). */
export const ISAPRE_PREMIUM_AGENT_KEY = "isaprespremium";

/** Alias sin «s» usado en documentación y enlaces legacy. */
export const ISAPRE_PREMIUM_AGENT_ALIASES = [
  "isaprepremium",
] as const;

export const ISAPRE_PREMIUM_WEBSITE = "https://isaprespremium.cl";

export const ISAPRE_PREMIUM_LOGO_PATH = "/images/partners/logo-isapre-premium.png";

/**
 * Paleta extraída del logo y sitio isaprespremium.cl:
 * - Verde vibrante (ISAPRES) como color principal de acción
 * - Teal/cian (PREMIUM, monograma) como secundario y acentos
 */
export const ISAPRE_PREMIUM_THEME: PartnerEntityTheme = {
  primary: "#6CC24A",
  primaryHover: "#5AB83D",
  primaryDark: "#1F8F84",
  primaryForeground: "#ffffff",
  secondary: "#2EAEA0",
  secondaryMuted: "#E8F7F5",
  bgLayout: "#ffffff",
  foreground: "#1a2e2b",
  muted: "#5c6b68",
  border: "#d4ebe8",
  surfaceHover: "#f0faf8",
  criteriaSurface: "#f4fbf9",
  criteriaRing: "#c5e8e3",
};

export function buildIsaprePremiumPartnerRecord(): PartnerEntityPublic {
  return {
    slug: ISAPRE_PREMIUM_AGENT_KEY,
    embedKey: ISAPRE_PREMIUM_AGENT_KEY,
    name: "Isapres Premium",
    logoUrl: ISAPRE_PREMIUM_LOGO_PATH,
    websiteUrl: ISAPRE_PREMIUM_WEBSITE,
    whatsappNumber: "56964133848",
    whatsappMessage:
      "Hola, quiero cotizar un plan de salud con Isapres Premium",
    exitLabel: "Volver a Isapres Premium",
    brandKey: "isapre-premium",
    theme: ISAPRE_PREMIUM_THEME,
  };
}

export function isIsaprePremiumAgentKey(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return (
    normalized === ISAPRE_PREMIUM_AGENT_KEY ||
    ISAPRE_PREMIUM_AGENT_ALIASES.some((alias) => alias === normalized)
  );
}
