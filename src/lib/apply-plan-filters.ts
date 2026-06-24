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
import type { DashboardFiltersState, PlanTypeFilterId } from "@/types/filters";
import type { HealthPlan } from "@/types/plan";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
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

function matchesCoveragePercent(
  plan: HealthPlan,
  type: "hospitalaria" | "ambulatoria",
  threshold: number | null,
): boolean {
  if (threshold === null) return true;
  const { hospitalaria, ambulatoria } = splitCoverageByType(plan.coverage);
  const entries = type === "hospitalaria" ? hospitalaria : ambulatoria;
  return coverageGlobalPercentage(entries) >= threshold;
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
      matchesCoveragePercent(
        plan,
        "hospitalaria",
        filters.hospitalCoveragePercent,
      ) &&
      matchesCoveragePercent(
        plan,
        "ambulatoria",
        filters.ambulatoryCoveragePercent,
      ),
  );
}
