import {
  findManyHealthPlans,
} from "@/lib/api/plan-query";
import type { HealthPlan } from "@/types/plan";

/** TTL del catálogo en memoria (evita N consultas completas a BD por sesión). */
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;

interface CatalogCacheEntry {
  plans: HealthPlan[];
  loadedAt: number;
}

let catalogCache: CatalogCacheEntry | null = null;
let catalogInflight: Promise<HealthPlan[]> | null = null;

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

  catalogInflight = findManyHealthPlans()
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
