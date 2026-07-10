import { prisma } from "@/lib/prisma";

export interface PlanCatalogClinicOption {
  id: string;
  name: string;
}

const CLINICS_CACHE_TTL_MS = 30 * 60 * 1000;

let clinicsCache: { items: PlanCatalogClinicOption[]; loadedAt: number } | null =
  null;
let clinicsInflight: Promise<PlanCatalogClinicOption[]> | null = null;

/** Clínicas presentes en el catálogo (consulta SQL directa, sin cargar todos los planes). */
export async function readPlanCatalogClinics(): Promise<PlanCatalogClinicOption[]> {
  const now = Date.now();

  if (clinicsCache && now - clinicsCache.loadedAt < CLINICS_CACHE_TTL_MS) {
    return clinicsCache.items;
  }

  if (clinicsInflight) {
    return clinicsInflight;
  }

  clinicsInflight = prisma
    .$queryRaw<Array<{ clinic_id: string; clinic_name: string }>>`
      SELECT DISTINCT clinic_id, clinic_name
      FROM coverage_entries
      WHERE clinic_id IS NOT NULL AND clinic_name IS NOT NULL
      ORDER BY clinic_name ASC
    `
    .then((rows) =>
      rows
        .map((row) => ({
          id: row.clinic_id.trim(),
          name: row.clinic_name.trim(),
        }))
        .filter((row) => row.id && row.name),
    )
    .then((items) => {
      clinicsCache = { items, loadedAt: Date.now() };
      return items;
    })
    .finally(() => {
      clinicsInflight = null;
    });

  return clinicsInflight;
}

export function invalidatePlanCatalogClinicsCache(): void {
  clinicsCache = null;
  clinicsInflight = null;
}
