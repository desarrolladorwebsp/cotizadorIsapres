import type {
  PartnerEntityPublic,
  PartnerEntityTheme,
} from "@/types/partner-entity";

/** Slug de la entidad por defecto cuando no hay cookie ni parámetro. */
export const DEFAULT_PARTNER_ENTITY_SLUG = "cotizaloantes";

export const COTIZALO_ANTES_THEME: PartnerEntityTheme = {
  primary: "#ed7d11",
  primaryHover: "#f59324",
  primaryDark: "#92450a",
  primaryForeground: "#ffffff",
  secondary: "#0e7c9c",
  secondaryMuted: "#eef6f8",
  bgLayout: "#ffffff",
  foreground: "#1a1a1a",
  muted: "#6b7280",
  border: "#e5e7eb",
  surfaceHover: "#f4f4f5",
  criteriaSurface: "#ffffff",
  criteriaRing: "#e5e7eb",
};

export const DESDETU7_THEME: PartnerEntityTheme = {
  primary: "#ff6600",
  primaryHover: "#ff8533",
  primaryDark: "#cc5200",
  primaryForeground: "#ffffff",
  secondary: "#111827",
  secondaryMuted: "#f5f7fa",
  bgLayout: "#ffffff",
  foreground: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surfaceHover: "#f4f4f5",
  criteriaSurface: "#ffffff",
  criteriaRing: "#e5e7eb",
};

export const FALLBACK_PARTNER_ENTITIES: Record<string, PartnerEntityPublic> = {
  cotizaloantes: {
    slug: "cotizaloantes",
    embedKey: "cotizaloantes",
    name: "Cotízalo Antes",
    logoUrl: "/images/logo-cotizalo-antes.png",
    websiteUrl: "https://cotizaloantes.cl",
    whatsappNumber: "56964133848",
    whatsappMessage: "Hola, quiero cotizar un plan de salud",
    exitLabel: "Volver a Cotízalo Antes",
    brandKey: "cotizalo-antes",
    theme: COTIZALO_ANTES_THEME,
  },
  desdetu7: {
    slug: "desdetu7",
    embedKey: "desdetu7",
    name: "Desde Tu 7",
    logoUrl: "https://desdetu7.cl/logo.png",
    websiteUrl: "https://desdetu7.cl",
    whatsappNumber: "56964133848",
    whatsappMessage: "Hola, quiero cotizar un plan de salud desde Desde Tu 7",
    exitLabel: "Volver a Desde Tu 7",
    brandKey: "desdetu7",
    theme: DESDETU7_THEME,
  },
};

export function getFallbackPartnerEntity(
  slug: string,
): PartnerEntityPublic | null {
  return FALLBACK_PARTNER_ENTITIES[slug.trim().toLowerCase()] ?? null;
}

export function getDefaultPartnerEntity(): PartnerEntityPublic {
  return (
    getFallbackPartnerEntity(DEFAULT_PARTNER_ENTITY_SLUG) ??
    FALLBACK_PARTNER_ENTITIES.cotizaloantes
  );
}
