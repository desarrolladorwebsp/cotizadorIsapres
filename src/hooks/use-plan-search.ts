"use client";

import { useCallback, useRef, useState } from "react";
import type { DashboardFiltersState } from "@/types/filters";
import type { HealthPlanSummary, PlanSearchResult } from "@/types/plan";

export interface PlanSearchRequest {
  q?: string;
  priceMin?: number;
  priceMax?: number;
  filters?: DashboardFiltersState;
  limit?: number;
  offset?: number;
}

export function usePlanSearch() {
  const [plans, setPlans] = useState<HealthPlanSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  const search = useCallback(async (request: PlanSearchRequest) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (request.q?.trim()) {
        params.set("q", request.q.trim());
      }
      if (request.priceMin !== undefined) {
        params.set("priceMin", String(request.priceMin));
      }
      if (request.priceMax !== undefined) {
        params.set("priceMax", String(request.priceMax));
      }
      if (request.filters) {
        params.set("filters", JSON.stringify(request.filters));
      }
      if (request.limit !== undefined) {
        params.set("limit", String(request.limit));
      }
      if (request.offset !== undefined) {
        params.set("offset", String(request.offset));
      }

      const response = await fetch(`/api/plans/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudieron buscar los planes.");
      }

      const data = (await response.json()) as PlanSearchResult;
      if (requestId !== requestIdRef.current) return;

      setPlans(data.plans);
      setTotal(data.total);
      setHasSearched(true);
    } catch (searchError) {
      if (requestId !== requestIdRef.current) return;
      setPlans([]);
      setTotal(0);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Error al buscar planes.",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    plans,
    total,
    loading,
    error,
    hasSearched,
    search,
  };
}
