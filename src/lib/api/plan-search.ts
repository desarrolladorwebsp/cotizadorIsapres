import { getCachedHealthPlans } from "@/lib/api/plan-catalog-cache";
import { mapHealthPlanToSummary } from "@/lib/api/plan-summary";
import { filterPlanCatalog } from "@/lib/filter-plan-catalog";
import {
  getActiveCheckboxIds,
  getActiveClinicIds,
  isCheckboxGroupActive,
} from "@/lib/filter-options";
import { sortPlansByBasePriceAsc } from "@/lib/plan-sort";
import type { DashboardFiltersState } from "@/types/filters";
import type { PlanSearchResult } from "@/types/plan";

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

export async function searchPlanSummaries(
  query: PlanSearchQuery,
): Promise<PlanSearchResult> {
  const dbPlans = await getCachedHealthPlans();
  return filterPlanCatalog(dbPlans, query);
}

/** Primeros N planes del catálogo (desde caché en memoria). */
export async function readLimitedPlanSummaries(
  limit: number,
): Promise<PlanSearchResult> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;

  const allPlans = await getCachedHealthPlans();
  const summaries = sortPlansByBasePriceAsc(
    allPlans.map(mapHealthPlanToSummary),
  ).slice(0, safeLimit);

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
  const clinicIds = getActiveClinicIds(filters);
  if (clinicIds.length > 0) {
    parts.push(`clinica:${clinicIds.join(",")}`);
  }
  return parts.join(" ");
}
