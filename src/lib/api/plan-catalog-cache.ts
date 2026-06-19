import { mapDbPlanToHealthPlan, type PlanWithCoverages } from "@/lib/api/plan-mapper";
import { prisma } from "@/lib/prisma";
import type { HealthPlan } from "@/types/plan";

const planInclude = { coverages: true, isapreRef: true } as const;

/** TTL del catálogo en memoria (evita N consultas completas a BD por sesión). */
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

interface CatalogCacheEntry {
  plans: HealthPlan[];
  loadedAt: number;
}

let catalogCache: CatalogCacheEntry | null = null;
let catalogInflight: Promise<HealthPlan[]> | null = null;

async function loadPlansFromDatabase(): Promise<HealthPlan[]> {
  const dbPlans = await prisma.plan.findMany({
    include: planInclude,
    orderBy: { planName: "asc" },
  });

  return (dbPlans as PlanWithCoverages[]).map(mapDbPlanToHealthPlan);
}

/** Catálogo completo en memoria con deduplicación de requests concurrentes. */
export async function getCachedHealthPlans(): Promise<HealthPlan[]> {
  const now = Date.now();

  if (
    catalogCache &&
    now - catalogCache.loadedAt < CATALOG_CACHE_TTL_MS
  ) {
    return catalogCache.plans;
  }

  if (catalogInflight) {
    return catalogInflight;
  }

  catalogInflight = loadPlansFromDatabase()
    .then((plans) => {
      catalogCache = { plans, loadedAt: Date.now() };
      return plans;
    })
    .finally(() => {
      catalogInflight = null;
    });

  return catalogInflight;
}

export function invalidatePlanCatalogCache(): void {
  catalogCache = null;
}
