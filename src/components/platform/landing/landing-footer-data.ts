/** Datos de contacto y redes — configurables sin tocar el componente. */
export const LANDING_FOOTER_CONTACT = {
  email: "contacto@cotizadorpremium.cl",
  phone: "+56 9 6413 3848",
  phoneHref: "tel:+56964133848",
  location: "Chile",
} as const;

export const LANDING_FOOTER_SOCIAL = [
  { id: "facebook", label: "Facebook", href: "#" },
  { id: "instagram", label: "Instagram", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "tiktok", label: "TikTok", href: "#" },
  { id: "whatsapp", label: "WhatsApp", href: "#" },
] as const;

export const LANDING_FOOTER_NAV = [
  { label: "Inicio", href: "#inicio" },
  { label: "Isapres", href: "#isapres" },
  { label: "Cotizador", href: "#cotizar" },
  { label: "Nuestros Socios", href: "#socios" },
  { label: "Reseñas", href: "#reseñas" },
  { label: "Contacto", href: "#contacto" },
] as const;

export const LANDING_FOOTER_DESCRIPTION =
  "Cotizador Premium te ayuda a comparar planes de ISAPRE con el respaldo de asesores especializados, entregando una experiencia rápida, segura y personalizada.";

export const LANDING_FOOTER_SMARTPRO_URL = "https://smartpro.cl";
