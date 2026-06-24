import {
  NORTE_ZONE_IDS,
  RM_ZONE_IDS,
  type ZoneId,
} from "@/types/zone";

const RM = [...RM_ZONE_IDS] as ZoneId[];
const RM_ORIENTE: ZoneId[] = ["rm-oriente", "rm-metropolitana"];
const RM_CENTRO: ZoneId[] = ["rm-centro", "rm-metropolitana"];
const RM_PONIENTE: ZoneId[] = ["rm-poniente", "rm-metropolitana"];
const RM_SUR: ZoneId[] = ["rm-sur", "rm-metropolitana"];
const RM_NORTE: ZoneId[] = ["rm-norte", "rm-metropolitana"];
const NORTE: ZoneId[] = [...NORTE_ZONE_IDS];
const VALPARAISO: ZoneId[] = ["valparaiso"];
const BIOBIO: ZoneId[] = ["biobio", "octava"];

/**
 * Zonas geográficas por clínica/prestador.
 * Una clínica puede pertenecer a varias zonas (ej. sector RM + RM completa).
 */
export const CLINIC_ZONE_MAP: Record<string, readonly ZoneId[]> = {
  // Redes con cobertura metropolitana amplia
  integramedica: RM,
  vidaintegra: RM,
  "cm-redsalud": RM,
  "cm-santa-maria": RM_ORIENTE,
  "cm-davila": RM_ORIENTE,
  "cm-red-davila": RM_ORIENTE,

  // RM Oriente
  "cl-las-condes": RM_ORIENTE,
  "cl-san-carlos": RM_ORIENTE,
  "cl-redsalud-vitacura": RM_ORIENTE,
  "red-uc-christus": RM_ORIENTE,
  "red-uc-christus-a3": RM_ORIENTE,
  "red-uc-christus-a4": RM_ORIENTE,
  "cl-indisa-providencia-anexo": RM_ORIENTE,
  "cl-redsalud-providencia": RM_ORIENTE,
  "cl-redsalud-providencia-avansalud": RM_ORIENTE,
  "cl-alemana-santiago": RM_ORIENTE,
  "cl-alemana-santiago-a": RM_ORIENTE,
  "cl-alemana-santiago-a2": RM_ORIENTE,
  "cl-alemana-santiago-a3": RM_ORIENTE,
  "cl-santa-maria": RM_ORIENTE,
  "cl-univ-andes": RM_ORIENTE,
  "cl-los-leones": RM_ORIENTE,
  "cl-los-carrera": RM_ORIENTE,
  "cl-cordillera": RM_ORIENTE,

  // RM Centro
  "cl-meds": RM_CENTRO,
  "cl-redsalud-santiago": RM_CENTRO,
  "cl-redsalud-santiago-bicentenario": RM_CENTRO,
  "cl-hospital-del-profesor": RM_CENTRO,
  "hosp-clinico-uc": RM_CENTRO,
  "hosp-clinico-uc-a2": RM_CENTRO,
  "hosp-clinico-uch": RM_CENTRO,
  "hosp-clinico-uch-a2": RM_CENTRO,
  "hosp-clinico-uch-a3": RM_CENTRO,
  "hosp-clinico-uch-a4": RM_CENTRO,

  // RM Poniente
  "cl-indisa-maipu": RM_PONIENTE,
  "cl-bupa-santiago": RM_PONIENTE,
  "cl-bupan-santiago": RM_PONIENTE,

  // RM Sur
  "hosp-parroquial-san-bernardo": RM_SUR,

  // RM Norte (sector)
  "cl-davila": RM_ORIENTE,
  "cl-davila-a3": RM_ORIENTE,
  "cl-davila-vespucio": RM_NORTE,

  // Zona Norte (regiones)
  "cl-san-jose-arica": NORTE,
  "cl-san-jose-interclinica": NORTE,
  "cl-atacama": NORTE,
  "cl-atacama-achs": NORTE,
  "cl-portada-achs": NORTE,
  "cl-regional-la-portada": NORTE,
  "cl-la-portada": NORTE,
  "cl-la-portad": NORTE,
  "cl-redsalud-iquique": NORTE,
  "cl-tarapaca": NORTE,
  "cl-redsalud-elqui": NORTE,
  "cl-andes-salud-el-loa": NORTE,
  "cl-bupa-antofagasta": NORTE,

  // Valparaíso
  "cl-redsalud-valparaiso": VALPARAISO,
  "cl-bupa-renaca": VALPARAISO,
  "cl-ciudad-del-mar": VALPARAISO,
  "hosp-vina-del-mar": VALPARAISO,

  // Biobío / sur central
  "cl-biobio": BIOBIO,
  "cl-andes-salud-concepcion": BIOBIO,
  "cl-los-andes-la": BIOBIO,
  "sanatorio-aleman": BIOBIO,
  "cl-andes-salud-chillan": BIOBIO,
  "cl-andes-salud-talca": BIOBIO,
  "cl-redsalud-rancagua": ["octava", "rm-metropolitana"],
  "hosp-clinico-fusat": BIOBIO,

  // Sur Austral
  "cl-alemana-osorno": BIOBIO,
  "cl-alemana-temuco": BIOBIO,
  "cl-alemana-valdivia": BIOBIO,
  "cl-andes-salud-puerto-montt": BIOBIO,
  "cl-puerto-montt": BIOBIO,
  "cl-puerto-varas": BIOBIO,
  "cl-redsalud-magallanes": BIOBIO,
  "cl-redsalud-mayor": BIOBIO,
};

export function resolveClinicZoneIds(clinicId: string): ZoneId[] {
  const zones = CLINIC_ZONE_MAP[clinicId.trim()];
  return zones ? [...zones] : [];
}

export function resolveClinicZoneIdsFromName(clinicName: string): ZoneId[] {
  const normalized = clinicName.trim().toLowerCase();
  for (const [clinicId, zones] of Object.entries(CLINIC_ZONE_MAP)) {
    if (clinicId.includes(normalized) || normalized.includes(clinicId)) {
      return [...zones];
    }
  }
  return [];
}
