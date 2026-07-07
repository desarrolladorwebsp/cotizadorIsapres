/** Imagen principal de la Landing — reemplazar el archivo en public sin cambiar la ruta. */
export const LANDING_FAMILY_HERO_IMAGE = "/images/landing/hero/familia-protegida.jpg";

export const LANDING_FAMILY_HERO_ALT =
  "Familia relajada en casa, transmitiendo tranquilidad y protección de salud";

/** Fondos por sección (misma imagen base; reemplazar en public/images/landing/sections/). */
export const LANDING_SECTION_BACKGROUNDS = {
  widget: "/images/landing/sections/cotizador-asesoria.jpg",
  partners: "/images/landing/sections/red-asesoria.jpg",
  isapres: "/images/landing/sections/salud-clinica.jpg",
  reviews: "/images/landing/sections/testimonios-familia.jpg",
} as const;

/** Fallback si aún no existen archivos en sections/ (usa hero). */
export const LANDING_SECTION_BACKGROUND_FALLBACK = LANDING_FAMILY_HERO_IMAGE;
