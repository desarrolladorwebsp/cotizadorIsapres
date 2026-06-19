"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyDashboardFilters,
  buildBeneficiaryGroupSummary,
  buildPlanFinalPriceQuote,
  createDefaultDashboardFilters,
} from "@/domain";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { useUfValue } from "@/hooks/use-uf-value";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/types/beneficiary";
import type { DashboardFiltersState } from "@/types/filters";
import type { HealthPlan } from "@/types/plan";

const INITIAL_BENEFICIARIES: FamilyBeneficiariesState = {
  contributorAge: null,
  dependents: [],
};

export interface CotizadorDashboardOptions {
  initialBeneficiaries?: FamilyBeneficiariesState;
  initialBeneficiarySummary?: BeneficiaryGroupSummary;
  initialDashboardFilters?: DashboardFiltersState;
  initialPriceMin?: number;
  initialPriceMax?: number;
}

export function useCotizadorDashboard(
  plansCatalog: HealthPlan[],
  options?: CotizadorDashboardOptions,
) {
  const seedBeneficiaries =
    options?.initialBeneficiaries ?? INITIAL_BENEFICIARIES;
  const seedSummary =
    options?.initialBeneficiarySummary ??
    buildBeneficiaryGroupSummary(seedBeneficiaries);

  const { ufToClp, loading: ufLoading, lastUpdated: ufLastUpdated, isFallback: ufIsFallback } =
    useUfValue();
  const isLargeScreen = useIsLargeScreen();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState(options?.initialPriceMin ?? 3);
  const [priceMax, setPriceMax] = useState(options?.initialPriceMax ?? 5);
  const [sortAsc, setSortAsc] = useState(true);
  const [beneficiaries, setBeneficiaries] =
    useState<FamilyBeneficiariesState>(seedBeneficiaries);
  const [beneficiarySummary, setBeneficiarySummary] =
    useState<BeneficiaryGroupSummary>(seedSummary);
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFiltersState>(
    () => options?.initialDashboardFilters ?? createDefaultDashboardFilters(),
  );

  useEffect(() => {
    setSidebarOpen(isLargeScreen);
    setSidebarReady(true);
  }, [isLargeScreen]);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const plans = applyDashboardFilters(
      plansCatalog,
      dashboardFilters,
    ).filter((plan) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        plan.plan_name.toLowerCase().includes(normalizedSearch) ||
        plan.unique_code.toLowerCase().includes(normalizedSearch) ||
        plan.isapre.toLowerCase().includes(normalizedSearch);

      const matchesPrice =
        plan.base_price_uf >= priceMin && plan.base_price_uf <= priceMax;

      return matchesSearch && matchesPrice;
    });

    return plans.sort((a, b) => {
      const priceA = buildPlanFinalPriceQuote(
        a.base_price_uf,
        beneficiarySummary,
        ufToClp,
      ).finalPriceUf;
      const priceB = buildPlanFinalPriceQuote(
        b.base_price_uf,
        beneficiarySummary,
        ufToClp,
      ).finalPriceUf;

      return sortAsc ? priceA - priceB : priceB - priceA;
    });
  }, [
    search,
    priceMin,
    priceMax,
    sortAsc,
    dashboardFilters,
    beneficiarySummary,
    plansCatalog,
    ufToClp,
  ]);

  function handleBeneficiariesChange(
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) {
    setBeneficiaries(next);
    setBeneficiarySummary(summary);
  }

  return {
    isLargeScreen,
    sidebarOpen,
    setSidebarOpen,
    sidebarReady,
    search,
    setSearch,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    sortAsc,
    setSortAsc,
    beneficiaries,
    beneficiarySummary,
    dashboardFilters,
    setDashboardFilters,
    filteredPlans,
    handleBeneficiariesChange,
    ufToClp,
    ufLoading,
    ufLastUpdated,
    ufIsFallback,
  };
}
