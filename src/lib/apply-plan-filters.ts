import {
  coverageGlobalPercentage,
  splitCoverageByType,
} from "@/lib/plan-format";
import { inferPlanTypes } from "@/lib/plan-metadata";
import { planMatchesZoneFilter } from "@/lib/plan-zones";
import {
  getActiveCheckboxIds,
  isCheckboxGroupActive,
  resolveIsapreDisplayName,
} from "@/lib/filter-options";
import { normalizeSearchText } from "@/lib/normalize-search-text";
import type { DashboardFiltersState, PlanTypeFilterId } from "@/types/filters";
import type { CoverageEntry, HealthPlan } from "@/types/plan";

function normalizeText(value: string): string {
  return normalizeSearchText(value);
}

function getCoverageEntriesByType(
  plan: HealthPlan,
  type: "hospitalaria" | "ambulatoria",
): CoverageEntry[] {
  const { hospitalaria, ambulatoria } = splitCoverageByType(plan.coverage);
  return type === "hospitalaria" ? hospitalaria : ambulatoria;
}

function matchesIsapreFilter(
  plan: HealthPlan,
  filters: DashboardFiltersState,
): boolean {
  if (!isCheckboxGroupActive(filters.isapres)) return true;
  const activeIds = getActiveCheckboxIds(filters.isapres);
  const planIsapre = normalizeText(plan.isapre);
  return activeIds.some((id) => {
    const label = normalizeText(resolveIsapreDisplayName(id));
    return planIsapre.includes(label) || label.includes(planIsapre);
  });
}

function matchesZoneFilter(
  plan: HealthPlan,
  filters: DashboardFiltersState,
): boolean {
  if (!isCheckboxGroupActive(filters.zones)) return true;
  const activeIds = getActiveCheckboxIds(filters.zones);
  return planMatchesZoneFilter(plan, activeIds);
}

function matchesPlanTypeFilter(
  plan: HealthPlan,
  filters: DashboardFiltersState,
): boolean {
  if (!isCheckboxGroupActive(filters.planTypes)) return true;
  const activeTypes = getActiveCheckboxIds(
    filters.planTypes,
  ) as PlanTypeFilterId[];
  const planTypes = inferPlanTypes(plan);
  return activeTypes.some((type) => planTypes.includes(type));
}

/**
 * Cobertura por tipo (hospitalaria / ambulatoria).
 * - Clínica + %: esa clínica debe tener cobertura >= umbral en ese tipo.
 * - Solo %: algún prestador del tipo debe cumplir >= umbral.
 * - Solo clínica (sin % en ningún tipo): el plan debe incluir la clínica.
 */
function matchesCoverageTypeFilter(
  plan: HealthPlan,
  type: "hospitalaria" | "ambulatoria",
  filters: DashboardFiltersState,
): boolean {
  const clinicId = filters.clinicId?.trim() || null;
  const threshold =
    type === "hospitalaria"
      ? filters.hospitalCoveragePercent
      : filters.ambulatoryCoveragePercent;

  const entries = getCoverageEntriesByType(plan, type);

  if (threshold !== null) {
    if (clinicId) {
      const clinicEntry = entries.find((entry) => entry.clinic_id === clinicId);
      return clinicEntry != null && clinicEntry.percentage >= threshold;
    }

    if (entries.length === 0) return false;
    const bestPercent = Math.max(...entries.map((entry) => entry.percentage));
    return bestPercent >= threshold;
  }

  return true;
}

function matchesClinicOnlyFilter(
  plan: HealthPlan,
  filters: DashboardFiltersState,
): boolean {
  const clinicId = filters.clinicId?.trim();
  if (!clinicId) return true;

  if (
    filters.hospitalCoveragePercent !== null ||
    filters.ambulatoryCoveragePercent !== null
  ) {
    return true;
  }

  return plan.coverage.some((entry) => entry.clinic_id === clinicId);
}

export function applyDashboardFilters(
  plans: HealthPlan[],
  filters: DashboardFiltersState,
): HealthPlan[] {
  return plans.filter(
    (plan) =>
      matchesIsapreFilter(plan, filters) &&
      matchesZoneFilter(plan, filters) &&
      matchesPlanTypeFilter(plan, filters) &&
      matchesClinicOnlyFilter(plan, filters) &&
      matchesCoverageTypeFilter(plan, "hospitalaria", filters) &&
      matchesCoverageTypeFilter(plan, "ambulatoria", filters),
  );
}

/** Evalúa cobertura en un plan completo (p. ej. resúmenes enriquecidos con detalle). */
export function planMatchesCoverageFilters(
  plan: HealthPlan,
  filters: DashboardFiltersState,
): boolean {
  return (
    matchesClinicOnlyFilter(plan, filters) &&
    matchesCoverageTypeFilter(plan, "hospitalaria", filters) &&
    matchesCoverageTypeFilter(plan, "ambulatoria", filters)
  );
}

/** Fallback cuando solo hay resumen agregado (sin detalle por clínica). */
export function summaryMatchesCoverageThresholds(
  hospitalAvg: number,
  ambulatoryAvg: number,
  filters: DashboardFiltersState,
): boolean {
  const clinicId = filters.clinicId?.trim();
  if (clinicId) return true;

  if (
    filters.hospitalCoveragePercent !== null &&
    hospitalAvg < filters.hospitalCoveragePercent
  ) {
    return false;
  }

  if (
    filters.ambulatoryCoveragePercent !== null &&
    ambulatoryAvg < filters.ambulatoryCoveragePercent
  ) {
    return false;
  }

  return true;
}

export function getBestCoveragePercentForType(
  plan: HealthPlan,
  type: "hospitalaria" | "ambulatoria",
): number {
  const entries = getCoverageEntriesByType(plan, type);
  if (entries.length === 0) return 0;
  return Math.max(...entries.map((entry) => entry.percentage));
}

export function getClinicCoveragePercent(
  plan: HealthPlan,
  type: "hospitalaria" | "ambulatoria",
  clinicId: string,
): number | null {
  const entry = getCoverageEntriesByType(plan, type).find(
    (item) => item.clinic_id === clinicId,
  );
  return entry?.percentage ?? null;
}
