import { resolveClinicZoneIds } from "@/lib/clinic-zones";
import type { ZoneId } from "@/types/zone";
import type { CoverageEntry } from "@/types/plan";

export interface PlanZoneSource {
  zones?: string[] | null;
  coverage: CoverageEntry[];
}

function uniqueZones(values: Iterable<string>): ZoneId[] {
  const seen = new Set<string>();
  const result: ZoneId[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed as ZoneId);
  }

  return result;
}

/** Une zonas explícitas del plan con las inferidas desde sus clínicas de cobertura. */
export function resolvePlanZoneIds(plan: PlanZoneSource): ZoneId[] {
  const fromExplicit = plan.zones ?? [];
  const fromClinics = plan.coverage.flatMap((entry) =>
    resolveClinicZoneIds(entry.clinic_id),
  );

  return uniqueZones([...fromExplicit, ...fromClinics]);
}

export function planMatchesZoneFilter(
  plan: PlanZoneSource,
  activeZoneIds: string[],
): boolean {
  if (activeZoneIds.length === 0) return true;

  const planZoneIds = resolvePlanZoneIds(plan);
  if (planZoneIds.length === 0) return false;

  const active = new Set(activeZoneIds);
  return planZoneIds.some((zoneId) => active.has(zoneId));
}
