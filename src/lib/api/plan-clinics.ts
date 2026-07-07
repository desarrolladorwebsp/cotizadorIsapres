import { getCachedHealthPlans } from "@/lib/api/plan-catalog-cache";

export interface PlanCatalogClinicOption {
  id: string;
  name: string;
}

/** Clínicas presentes en el catálogo de planes (para filtro del cotizador público). */
export async function readPlanCatalogClinics(): Promise<PlanCatalogClinicOption[]> {
  const plans = await getCachedHealthPlans();
  const clinics = new Map<string, string>();

  for (const plan of plans) {
    for (const entry of plan.coverage) {
      const id = entry.clinic_id?.trim();
      const name = entry.clinic_name?.trim();
      if (!id || !name) continue;
      if (!clinics.has(id)) {
        clinics.set(id, name);
      }
    }
  }

  return [...clinics.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
