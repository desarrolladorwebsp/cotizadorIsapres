"use client";

import { useEffect, useState } from "react";
import type { HealthPlan } from "@/types/plan";

const planDetailCache = new Map<string, HealthPlan>();

export function usePlanDetail(uniqueCode: string | null, enabled: boolean) {
  const [plan, setPlan] = useState<HealthPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !uniqueCode) {
      setPlan(null);
      setLoading(false);
      setError(null);
      return;
    }

    const cached = planDetailCache.get(uniqueCode);
    if (cached) {
      setPlan(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadPlan() {
      try {
        const response = await fetch(
          `/api/plans/${encodeURIComponent(uniqueCode!)}`,
        );
        if (!response.ok) {
          throw new Error("No se pudo cargar el detalle del plan.");
        }
        const data = (await response.json()) as HealthPlan;
        if (cancelled) return;
        planDetailCache.set(uniqueCode!, data);
        setPlan(data);
      } catch (loadError) {
        if (cancelled) return;
        setPlan(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Error al cargar el plan.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPlan();
    return () => {
      cancelled = true;
    };
  }, [uniqueCode, enabled]);

  return { plan, loading, error };
}

export function primePlanDetailCache(plan: HealthPlan) {
  planDetailCache.set(plan.unique_code, plan);
}
