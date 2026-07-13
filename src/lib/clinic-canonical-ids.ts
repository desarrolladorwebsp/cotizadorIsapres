/**
 * IDs de clínica duplicados que deben resolverse al catálogo canónico.
 * Generado a partir de nombres equivalentes en BD (misma clínica, distinto import).
 *
 * No incluye entradas Libre Elección por isapre (mv-/vt-/col-).
 */
export const CLINIC_MERGE_TO_CANONICAL: Record<string, string> = {
  "cl-clinica-san-jose": "cl-san-jose-arica",
  "clinica-redsalud-valparaiso": "cl-redsalud-valparaiso",
  "clinica-redsalud-iquique": "cl-redsalud-iquique",
  "clinica-alemana-de-temuco": "cl-alemana-temuco",
  "clinica-redsalud-rancagua": "cl-redsalud-rancagua",
  "cl-uc": "hosp-clinico-uc",
  "cl-la-portada": "cl-portada-achs",
  "clinica-portada-achs-salud": "cl-portada-achs",
  "clinica-redsalud-magallanes": "cl-redsalud-magallanes",
  "hosp-clinico-fusat": "hospital-clinico-fusat",
  "clinica-biobio": "cl-biobio",
  "clinica-alemana": "cl-alemana-santiago",
  "cl-alemana-santiago-a3": "cl-alemana-santiago",
  "clinica-san-carlos-de-apoquindo": "cl-san-carlos",
  "clinica-los-carrera-interclinica": "cl-los-carrera",
  "clinica-andes-salud-el-loa": "cl-andes-salud-el-loa",
  "clinica-bupa-antofagasta": "cl-bupa-antofagasta",
  "clinica-andes-salud-concepcion": "cl-andes-salud-concepcion",
  "clinica-los-leones": "cl-los-leones",
  "clinica-davila-vespucio": "cl-davila-vespucio",
  "clinica-tarapaca-interclinica": "cl-tarapaca-interclinica",
  "clinica-indisa": "cl-indisa-providencia-anexo",
  "clinica-atacama-achs-salud": "cl-atacama-achs",
  "cl-clinica-atacama-achs-salud": "cl-atacama-achs",
  "clinica-universidad-de-los-andes": "cl-univ-andes",
  "clinica-andes-salud-puerto-montt": "cl-andes-salud-puerto-montt",
  "clinica-puerto-varas": "cl-puerto-varas",
  "hospital-clinico-vina-del-mar": "hosp-vina-del-mar",
  "clinica-puerto-montt-achs-salud": "cl-puerto-montt",
  "clinica-del-sur-achs-salud": "hosp-clinico-del-sur",
  "clinica-redsalud-providencia": "cl-redsalud-providencia",
  "centros-medicos-clinica-santa-maria": "cm-santa-maria",
  "sanatorio-aleman": "clinica-sanatorio-aleman",
  "cl-clinica-regional-la-portada": "cl-regional-la-portada",
  "cm-andes-salud-talca": "centro-medico-andes-salud-talca",
  "cl-andes-salud-talca": "centro-medico-andes-salud-talca",
  "clinica-lircay-achs-salud": "centro-medico-andes-salud-talca",
  "clinica-alemana-de-valdivia": "cl-alemana-valdivia",
  "cl-redsalud-providencia-avansalud": "cl-clinica-redsalud-providencia-ex-avansalud",
  "cl-centromed": "centromed",
  "clinica-alemana-de-osorno": "cl-alemana-osorno",
  "clinica-bupa-renaca": "cl-bupa-renaca",
  "clinica-renaca": "cl-clinica-renaca",
  "cl-redsalud-santiago-bicentenario": "cl-clinica-redsalud-santiago-ex-bicentenario",
  "clinica-san-jose-interclinica": "cl-san-jose-interclinica",
  "clinica-cordillera": "cl-cordillera",
  "clinica-redsalud-elqui": "cl-redsalud-elqui",
  "centros-medicos-red-uc-christus": "red-uc-christus",
  "clinica-ciudad-del-mar": "cl-ciudad-del-mar",
  "clinica-redsalud-mayor-temuco": "cl-redsalud-mayor",
};

const FLATTENED_MERGE_MAP = flattenClinicMergeMap(CLINIC_MERGE_TO_CANONICAL);

function flattenClinicMergeMap(
  map: Record<string, string>,
): Record<string, string> {
  const flat = { ...map };
  let changed = true;

  while (changed) {
    changed = false;
    for (const [fromId, toId] of Object.entries(flat)) {
      const next = flat[toId];
      if (next && next !== toId) {
        flat[fromId] = next;
        changed = true;
      }
    }
  }

  return flat;
}

export function resolveCanonicalClinicId(clinicId: string): string {
  const trimmed = clinicId.trim();
  if (!trimmed) return trimmed;
  return FLATTENED_MERGE_MAP[trimmed] ?? trimmed;
}

export function isDeprecatedClinicId(clinicId: string): boolean {
  const trimmed = clinicId.trim();
  return Boolean(trimmed && FLATTENED_MERGE_MAP[trimmed]);
}

export function listClinicMergePairs(): Array<{ from: string; to: string }> {
  return Object.entries(FLATTENED_MERGE_MAP).map(([from, to]) => ({ from, to }));
}
