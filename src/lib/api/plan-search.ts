import { applyDashboardFilters } from "@/lib/apply-plan-filters";
import { getCachedHealthPlans } from "@/lib/api/plan-catalog-cache";
import { mapHealthPlanToSummary } from "@/lib/api/plan-summary";
import {
  getActiveCheckboxIds,
  isCheckboxGroupActive,
} from "@/lib/filter-options";
import { MAX_PLAN_SEARCH_LIMIT } from "@/lib/plan-search-config";
import type { DashboardFiltersState } from "@/types/filters";
import type { HealthPlan, HealthPlanSummary, PlanSearchResult } from "@/types/plan";

export interface PlanSearchQuery {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  filters?: DashboardFiltersState;
  limit?: number;
  offset?: number;
}

function parseDashboardFilters(
  searchParams: URLSearchParams,
): DashboardFiltersState | undefined {
  const raw = searchParams.get("filters");
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as DashboardFiltersState;
  } catch {
    return undefined;
  }
}

export function parsePlanSearchQuery(
  searchParams: URLSearchParams,
): PlanSearchQuery {
  const priceMinRaw = searchParams.get("priceMin");
  const priceMaxRaw = searchParams.get("priceMax");

  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");

  return {
    q: searchParams.get("q")?.trim() || undefined,
    priceMin: priceMinRaw !== null ? Number(priceMinRaw) : undefined,
    priceMax: priceMaxRaw !== null ? Number(priceMaxRaw) : undefined,
    filters: parseDashboardFilters(searchParams),
    limit: limitRaw !== null ? Number(limitRaw) : undefined,
    offset: offsetRaw !== null ? Number(offsetRaw) : undefined,
  };
}

function matchesTextQuery(plan: HealthPlanSummary, query: string): boolean {
  const normalized = query.toLowerCase();
  return (
    plan.plan_name.toLowerCase().includes(normalized) ||
    plan.unique_code.toLowerCase().includes(normalized) ||
    plan.isapre.toLowerCase().includes(normalized)
  );
}

function matchesPriceRange(
  plan: HealthPlanSummary,
  priceMin?: number,
  priceMax?: number,
): boolean {
  if (priceMin !== undefined && Number.isFinite(priceMin)) {
    if (plan.base_price_uf < priceMin) return false;
  }
  if (priceMax !== undefined && Number.isFinite(priceMax)) {
    if (plan.base_price_uf > priceMax) return false;
  }
  return true;
}

function matchesCoverageThresholds(
  plan: HealthPlanSummary,
  filters: DashboardFiltersState,
): boolean {
  if (filters.hospitalCoveragePercent !== null) {
    if (plan.coverage_summary.hospital_avg < filters.hospitalCoveragePercent) {
      return false;
    }
  }
  if (filters.ambulatoryCoveragePercent !== null) {
    if (plan.coverage_summary.ambulatory_avg < filters.ambulatoryCoveragePercent) {
      return false;
    }
  }
  return true;
}

function matchesFiltersWithoutCoverageAvg(
  plans: HealthPlan[],
  filters: DashboardFiltersState,
): HealthPlan[] {
  return applyDashboardFilters(plans, {
    ...filters,
    hospitalCoveragePercent: null,
    ambulatoryCoveragePercent: null,
  });
}

function clampSearchLimit(limit: number | undefined, total: number): number {
  if (limit === undefined || !Number.isFinite(limit) || limit <= 0) {
    return total;
  }

  return Math.min(Math.floor(limit), MAX_PLAN_SEARCH_LIMIT, total);
}

export async function searchPlanSummaries(
  query: PlanSearchQuery,
): Promise<PlanSearchResult> {
  const dbPlans = await getCachedHealthPlans();

  let plans = dbPlans;

  if (query.filters) {
    plans = matchesFiltersWithoutCoverageAvg(plans, query.filters);
  }

  let summaries = plans.map(mapHealthPlanToSummary);

  if (query.filters) {
    summaries = summaries.filter((plan) =>
      matchesCoverageThresholds(plan, query.filters!),
    );
  }

  if (query.q) {
    summaries = summaries.filter((plan) => matchesTextQuery(plan, query.q!));
  }

  summaries = summaries.filter((plan) =>
    matchesPriceRange(plan, query.priceMin, query.priceMax),
  );

  const total = summaries.length;
  const offset =
    query.offset !== undefined && Number.isFinite(query.offset) && query.offset > 0
      ? Math.floor(query.offset)
      : 0;
  const limit = clampSearchLimit(query.limit, total);

  return {
    plans: summaries.slice(offset, offset + limit),
    total,
    limit,
    offset,
  };
}

/** Primeros N planes del catálogo (desde caché en memoria). */
export async function readLimitedPlanSummaries(
  limit: number,
): Promise<PlanSearchResult> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;

  const allPlans = await getCachedHealthPlans();
  const summaries = allPlans
    .slice(0, safeLimit)
    .map(mapHealthPlanToSummary);

  return {
    plans: summaries,
    total: allPlans.length,
    limit: safeLimit,
    offset: 0,
  };
}

export async function readPlanCatalogBounds(): Promise<{
  priceMin: number;
  priceMax: number;
  totalPlans: number;
}> {
  const plans = await getCachedHealthPlans();

  if (plans.length === 0) {
    return { priceMin: 0, priceMax: 10, totalPlans: 0 };
  }

  let priceMin = plans[0].base_price_uf;
  let priceMax = plans[0].base_price_uf;

  for (const plan of plans) {
    if (plan.base_price_uf < priceMin) priceMin = plan.base_price_uf;
    if (plan.base_price_uf > priceMax) priceMax = plan.base_price_uf;
  }

  return {
    priceMin,
    priceMax,
    totalPlans: plans.length,
  };
}

/** Expone filtros activos para depuración en cliente (opcional). */
export function describeActiveFilters(filters: DashboardFiltersState): string {
  const parts: string[] = [];
  if (isCheckboxGroupActive(filters.isapres)) {
    parts.push(`isapres:${getActiveCheckboxIds(filters.isapres).join(",")}`);
  }
  if (isCheckboxGroupActive(filters.planTypes)) {
    parts.push(`tipos:${getActiveCheckboxIds(filters.planTypes).join(",")}`);
  }
  if (isCheckboxGroupActive(filters.zones)) {
    parts.push(`zonas:${getActiveCheckboxIds(filters.zones).join(",")}`);
  }
  if (filters.clinicId?.trim()) {
    parts.push(`clinica:${filters.clinicId.trim()}`);
  }
  return parts.join(" ");
}
