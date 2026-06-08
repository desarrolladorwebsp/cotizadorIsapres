"use client";

import { useEffect, useState } from "react";
import type { HealthPlan } from "@/types/plan";

export function usePlansCatalog() {
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const response = await fetch("/api/plans");
        if (!response.ok) throw new Error("No se pudieron cargar los planes.");
        const data = (await response.json()) as HealthPlan[];
        if (!cancelled) {
          setPlans(data);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setPlans([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Error al cargar planes.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, loading, error };
}
