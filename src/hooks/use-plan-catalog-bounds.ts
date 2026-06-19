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

const BOUNDS_CACHE_KEY = "cotizador:plan-bounds";
const BOUNDS_CACHE_TTL_MS = 5 * 60 * 1000;

function readCachedBounds(): PlanCatalogBounds | null {
  if (typeof sessionStorage === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(BOUNDS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PlanCatalogBounds & { cachedAt: number };
    if (Date.now() - parsed.cachedAt > BOUNDS_CACHE_TTL_MS) {
      sessionStorage.removeItem(BOUNDS_CACHE_KEY);
      return null;
    }

    return {
      priceMin: parsed.priceMin,
      priceMax: parsed.priceMax,
      totalPlans: parsed.totalPlans,
    };
  } catch {
    return null;
  }
}

function writeCachedBounds(bounds: PlanCatalogBounds) {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(
      BOUNDS_CACHE_KEY,
      JSON.stringify({ ...bounds, cachedAt: Date.now() }),
    );
  } catch {
    // Ignora cuota llena o modo privado estricto.
  }
}

export function usePlanCatalogBounds() {
  const [bounds, setBounds] = useState<PlanCatalogBounds>(() => {
    return readCachedBounds() ?? DEFAULT_BOUNDS;
  });
  const [loading, setLoading] = useState(() => readCachedBounds() === null);

  useEffect(() => {
    const cached = readCachedBounds();
    if (cached) {
      setBounds(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBounds() {
      try {
        const response = await fetch("/api/plans/bounds");
        if (!response.ok) return;
        const data = (await response.json()) as PlanCatalogBounds;
        if (!cancelled) {
          setBounds(data);
          writeCachedBounds(data);
        }
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
