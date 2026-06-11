"use client";

import { useEffect, useState } from "react";

interface PlanCatalogBounds {
  priceMin: number;
  priceMax: number;
  totalPlans: number;
}

const DEFAULT_BOUNDS: PlanCatalogBounds = {
  priceMin: 0,
  priceMax: 10,
  totalPlans: 0,
};

export function usePlanCatalogBounds() {
  const [bounds, setBounds] = useState<PlanCatalogBounds>(DEFAULT_BOUNDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBounds() {
      try {
        const response = await fetch("/api/plans/bounds");
        if (!response.ok) return;
        const data = (await response.json()) as PlanCatalogBounds;
        if (!cancelled) setBounds(data);
      } catch {
        // Mantiene valores por defecto.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBounds();
    return () => {
      cancelled = true;
    };
  }, []);

  return { bounds, loading };
}
