/**
 * Mapeo verificado entre IDs del catálogo (tabla clinics) y claves del asset
 * `clinic-locations.json`. Solo incluye equivalencias confirmadas en
 * `scripts/build-clinic-locations.mjs` (curadas / geocodificadas).
 */
export const CLINIC_LOCATION_JSON_ALIASES: Record<string, string> = {
  "clinica-redsalud-rancagua": "cl-redsalud-rancagua",
  "clinica-redsalud-iquique": "cl-redsalud-iquique",
  "clinica-redsalud-elqui": "cl-redsalud-elqui",
  "clinica-andes-salud-el-loa": "cl-andes-salud-el-loa",
  "clinica-cordillera": "cl-cordillera",
  "clinica-san-carlos-de-apoquindo": "cl-san-carlos",
  "clinica-san-jose-interclinica": "cl-san-jose-interclinica",
  "clinica-atacama-achs-salud": "cl-clinica-atacama-achs-salud",
  "clinica-indisa": "cl-indisa-providencia-anexo",
  "clinica-portada-achs-salud": "cl-portada-achs",
  "clinica-lircay-achs-salud": "centro-medico-andes-salud-talca",
  "cl-andes-salud-talca": "centro-medico-andes-salud-talca",
  "clinica-del-sur-achs-salud": "cl-biobio",
  "centros-medicos-clinica-santa-maria": "cm-santa-maria",
  "cm-andes-salud-talca": "centro-medico-andes-salud-talca",
};

const LIBRE_ELECCION_PATTERN = /libre[\s-]*elecci[oó]n/i;

export function isVirtualClinicId(clinicId: string, clinicName?: string): boolean {
  if (LIBRE_ELECCION_PATTERN.test(clinicId)) return true;
  if (clinicName && LIBRE_ELECCION_PATTERN.test(clinicName)) return true;
  return false;
}

export function resolveClinicLocationJsonKey(clinicId: string): string {
  if (CLINIC_LOCATION_JSON_ALIASES[clinicId]) {
    return CLINIC_LOCATION_JSON_ALIASES[clinicId];
  }
  return clinicId;
}
