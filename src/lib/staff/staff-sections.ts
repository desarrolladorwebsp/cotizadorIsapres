export type StaffSection =
  | "inicio"
  | "calendario"
  | "cotizador"
  | "clientes"
  | "cotizaciones"
  | "mapa"
  | "prospectos"
  | "usuarios"
  | "clinicas"
  | "ges"
  | "reportes-pdf"
  | "convenios";

export const STAFF_SECTION_QUERY = "section";

/** Secciones base del administrador (incluye cotizaciones). */
export const STAFF_BASE_SECTIONS: StaffSection[] = [
  "inicio",
  "clientes",
  "calendario",
  "cotizador",
  "cotizaciones",
  "mapa",
];

export const STAFF_ADMIN_SECTIONS: StaffSection[] = [
  "prospectos",
  "usuarios",
  "clinicas",
  "ges",
  "reportes-pdf",
  "convenios",
];

/** Ejecutivo Isapres Premium. */
export const STAFF_PREMIUM_SECTIONS: StaffSection[] = [
  "inicio",
  "clientes",
  "calendario",
  "cotizador",
  "mapa",
];

/** Ejecutivo Zoom / Ejecutivo Isapres. */
export const STAFF_LIMITED_EXECUTIVE_SECTIONS: StaffSection[] = [
  "inicio",
  "clientes",
  "calendario",
];

const ALL_SECTIONS = new Set<StaffSection>([
  ...STAFF_BASE_SECTIONS,
  ...STAFF_ADMIN_SECTIONS,
  ...STAFF_PREMIUM_SECTIONS,
  ...STAFF_LIMITED_EXECUTIVE_SECTIONS,
]);

export function isStaffSection(value: string | null | undefined): value is StaffSection {
  return Boolean(value && ALL_SECTIONS.has(value as StaffSection));
}

export function staffSectionHref(section: StaffSection): string {
  return `/cotizador/ejecutivos?${STAFF_SECTION_QUERY}=${section}`;
}

/** Mapeo de rutas legacy `/cotizador/admin/*` hacia secciones unificadas. */
export function mapLegacyAdminPath(pathname: string): StaffSection | null {
  if (pathname === "/cotizador/admin/usuarios") return "usuarios";
  if (pathname === "/cotizador/admin") return "prospectos";
  return null;
}
