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
 * Paleta oficial Isapres Premium (turquesa petróleo + verde esmeralda).
 * Gradiente de marca: #0F8D8E → #22B573 (ver también globals.css).
 */
export const ISAPRE_PREMIUM_THEME: PartnerEntityTheme = {
  /** CTA principal — verde profundo */
  primary: "#0A6F73",
  /** Hover CTA — turquesa oscuro */
  primaryHover: "#08777A",
  /** Texto principal — azul petróleo */
  primaryDark: "#154B56",
  primaryForeground: "#ffffff",
  /** Color secundario — verde esmeralda */
  secondary: "#22B573",
  secondaryMuted: "#E8F5F2",
  /** Fondos suaves — gris azulado muy claro */
  bgLayout: "#F7FAFB",
  foreground: "#154B56",
  muted: "#7A8D93",
  border: "#E6EFF0",
  surfaceHover: "#EEF5F6",
  /** Brand primary — turquesa petróleo (barra de criterios) */
  criteriaSurface: "#0F8D8E",
  criteriaRing: "#0A6F73",
  convenioAccent: "#0F8D8E",
  convenioAccentStrong: "#22B573",
  convenioAccentMuted: "#E8F5F2",
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
