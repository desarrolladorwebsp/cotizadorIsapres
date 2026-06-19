import { applyDashboardFilters } from "@/lib/apply-plan-filters";
import {
  mapDbPlanToHealthPlan,
  type PlanWithCoverages,
} from "@/lib/api/plan-mapper";
import { mapHealthPlanToSummary } from "@/lib/api/plan-summary";
import {
  getActiveCheckboxIds,
  isCheckboxGroupActive,
} from "@/lib/filter-options";
import { prisma } from "@/lib/prisma";
import type { DashboardFiltersState } from "@/types/filters";
import type { HealthPlanSummary, PlanSearchResult } from "@/types/plan";

const planInclude = { coverages: true, isapreRef: true } as const;

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
  plans: ReturnType<typeof mapDbPlanToHealthPlan>[],
  filters: DashboardFiltersState,
): ReturnType<typeof mapDbPlanToHealthPlan>[] {
  return applyDashboardFilters(plans, {
    ...filters,
    hospitalCoveragePercent: null,
    ambulatoryCoveragePercent: null,
  });
}

export async function searchPlanSummaries(
  query: PlanSearchQuery,
): Promise<PlanSearchResult> {
  const dbPlans = await prisma.plan.findMany({
    include: planInclude,
    orderBy: { planName: "asc" },
  });

  let plans = (dbPlans as PlanWithCoverages[]).map(mapDbPlanToHealthPlan);

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
  const limit =
    query.limit !== undefined && Number.isFinite(query.limit) && query.limit > 0
      ? Math.floor(query.limit)
      : total;

  return {
    plans: summaries.slice(offset, offset + limit),
    total,
    limit,
    offset,
  };
}

/** Primeros N planes del catálogo (consulta acotada en BD, sin cargar todo el catálogo). */
export async function readLimitedPlanSummaries(
  limit: number,
): Promise<PlanSearchResult> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 1;

  const [dbPlans, total] = await Promise.all([
    prisma.plan.findMany({
      include: planInclude,
      orderBy: { planName: "asc" },
      take: safeLimit,
    }),
    prisma.plan.count(),
  ]);

  const summaries = (dbPlans as PlanWithCoverages[])
    .map(mapDbPlanToHealthPlan)
    .map(mapHealthPlanToSummary);

  return {
    plans: summaries,
    total,
    limit: safeLimit,
    offset: 0,
  };
}

export async function readPlanCatalogBounds(): Promise<{
  priceMin: number;
  priceMax: number;
  totalPlans: number;
}> {
  const aggregate = await prisma.plan.aggregate({
    _min: { basePriceUf: true },
    _max: { basePriceUf: true },
    _count: { _all: true },
  });

  return {
    priceMin: aggregate._min.basePriceUf ?? 0,
    priceMax: aggregate._max.basePriceUf ?? 10,
    totalPlans: aggregate._count._all,
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
  return parts.join(" ");
}
