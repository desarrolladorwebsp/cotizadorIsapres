/** Datos de contacto y redes — configurables sin tocar el componente. */
export const LANDING_FOOTER_CONTACT = {
  email: "contacto@cotizadorpremium.cl",
  phone: "+56 9 6582 2864",
  phoneHref: "tel:+56965822864",
  location: "Chile",
} as const;

export const LANDING_FOOTER_SOCIAL = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591687383169",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/cotizadorpremium",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/56965822864",
  },
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

export const LANDING_FOOTER_SMARTPRO_LOGO =
  "/images/landing/sections/logo-smartpro.png";

export const LANDING_FOOTER_SMARTPRO_LABEL = "SmartPro — Agencia de Marketing";
