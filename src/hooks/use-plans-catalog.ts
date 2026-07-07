"use client";

import { useEffect, useState } from "react";
import { loadPlanCatalogClient } from "@/lib/load-plan-catalog-client";
import type { HealthPlan } from "@/types/plan";

export function usePlansCatalog() {
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadPlanCatalogClient({
      endpoint: "/api/plans",
      credentials: "include",
    })
      .then((data) => {
        if (!cancelled) {
          setPlans(data);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setPlans([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Error al cargar planes.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, loading, error };
}
