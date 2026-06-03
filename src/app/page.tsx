"use client";

import { useEffect, useMemo, useState } from "react";
import planesData from "@/assets/planes.json";
import { FiltersFab, FiltersSidebar } from "@/components/filters";
import { PlanResultsList } from "@/components/plan-card";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { applyDashboardFilters } from "@/lib/apply-plan-filters";
import { buildBeneficiaryGroupSummary } from "@/lib/beneficiary-summary";
import { createDefaultDashboardFilters } from "@/lib/filter-options";
import { DEFAULT_UF_VALUE_CLP } from "@/lib/economic-indicators";
import { buildPlanFinalPriceQuote } from "@/lib/plan-final-price";
import { formatPlanClp, formatPlanUf } from "@/lib/plan-format";
import { appShell, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/types/beneficiary";
import type { DashboardFiltersState } from "@/types/filters";
import type { HealthPlan } from "@/types/plan";

const UF_TO_CLP = DEFAULT_UF_VALUE_CLP;

const INITIAL_BENEFICIARIES: FamilyBeneficiariesState = {
  contributorAge: 34,
  dependents: [{ id: "initial-dependent", age: 32 }],
};

export default function DashboardPage() {
  const isLargeScreen = useIsLargeScreen();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState(3);
  const [priceMax, setPriceMax] = useState(5);
  const [sortAsc, setSortAsc] = useState(true);
  const [beneficiaries, setBeneficiaries] =
    useState<FamilyBeneficiariesState>(INITIAL_BENEFICIARIES);
  const [beneficiarySummary, setBeneficiarySummary] =
    useState<BeneficiaryGroupSummary>(() =>
      buildBeneficiaryGroupSummary(INITIAL_BENEFICIARIES),
    );
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFiltersState>(
    createDefaultDashboardFilters,
  );

  useEffect(() => {
    setSidebarOpen(isLargeScreen);
    setSidebarReady(true);
  }, [isLargeScreen]);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const plans = applyDashboardFilters(
      planesData as HealthPlan[],
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
        UF_TO_CLP,
      ).finalPriceUf;
      const priceB = buildPlanFinalPriceQuote(
        b.base_price_uf,
        beneficiarySummary,
        UF_TO_CLP,
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
  ]);

  function handleBeneficiariesChange(
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) {
    setBeneficiaries(next);
    setBeneficiarySummary(summary);
  }

  return (
    <div className={joinClasses("flex min-h-screen flex-col", ui.canvas)}>
      <header
        className={joinClasses(
          "sticky top-0 z-30 border-b bg-white shadow-sm",
          ui.border,
        )}
      >
        <div className="flex h-14 min-h-14 items-center gap-3 px-4 sm:h-[4.5rem] sm:gap-6 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className={joinClasses(
              touchTarget,
              "rounded-lg text-muted transition lg:hidden",
              ui.borderHairline,
              ui.hoverSurface,
            )}
            aria-label={sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm sm:size-10">
              CI
            </div>
            <div className="min-w-0">
              <p
                className={joinClasses(
                  "truncate text-sm font-bold tracking-tight sm:text-base",
                  ui.sectionTitle,
                )}
              >
                Cotizador Inteligente
              </p>
              <p className="truncate text-xs text-muted">
                Comparador de planes Isapre
              </p>
            </div>
          </div>

          <div className="mx-auto hidden max-w-md flex-1 justify-center md:flex">
            <div
              className={joinClasses(
                "inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm",
                ui.borderHairline,
              )}
            >
              <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              <span className="text-muted">Cotización activa</span>
              <span className="font-medium tracking-tight text-foreground">
                #CI-2406
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium tracking-tight text-foreground">
                Alfredo Hurtado
              </p>
              <p className="text-xs text-muted">Ejecutivo comercial</p>
            </div>
            <div
              className={joinClasses(
                touchTarget,
                "rounded-full text-sm font-medium text-muted md:size-10",
                ui.borderHairline,
              )}
              aria-hidden
            >
              AH
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarReady ? (
          <FiltersSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            beneficiaries={beneficiaries}
            onBeneficiariesChange={handleBeneficiariesChange}
            filters={dashboardFilters}
            onFiltersChange={setDashboardFilters}
          />
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className={joinClasses(appShell, "flex flex-col gap-6 sm:gap-8 xl:gap-10")}>
            <section
              className={joinClasses(
                "grid gap-5 rounded-xl border bg-white p-4 shadow-card sm:gap-6 sm:p-6",
                "md:grid-cols-2 md:items-end",
                "lg:grid-cols-[1fr_minmax(14rem,20rem)_auto] lg:gap-8 lg:p-8",
                ui.border,
              )}
            >
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label
                  htmlFor="plan-search"
                  className="text-xs font-medium text-muted"
                >
                  Buscar planes
                </label>
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted/60"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
                    id="plan-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre, código o Isapre..."
                    className={joinClasses(
                      "h-12 w-full rounded-lg py-2 pl-10 pr-4 text-base md:h-11 md:text-sm",
                      ui.input,
                    )}
                  />
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted">Rango de precio</span>
                  <span className="tabular-nums text-muted/80">
                    {formatPlanUf(priceMin)} – {formatPlanUf(priceMax)}
                  </span>
                </div>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={priceMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPriceMin(Math.min(value, priceMax));
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white md:[&::-webkit-slider-thumb]:size-4"
                  />
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={priceMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPriceMax(Math.max(value, priceMin));
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white md:[&::-webkit-slider-thumb]:size-4"
                  />
                </div>
                <p className="text-[11px] text-muted/80">
                  Aprox. {formatPlanClp(priceMin * UF_TO_CLP)} –{" "}
                  {formatPlanClp(priceMax * UF_TO_CLP)} en pesos
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSortAsc((value) => !value)}
                className={joinClasses(
                  touchTarget,
                  "w-full justify-center gap-2 rounded-lg px-5 text-sm font-medium md:w-auto",
                  ui.ctaOutline,
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4 shrink-0 text-muted"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path
                    d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l3 3M17 4l-3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {sortAsc ? "Menor a Mayor" : "Mayor a Menor"}
              </button>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                <span className="font-bold text-primary-dark">
                  {filteredPlans.length}
                </span>{" "}
                planes encontrados
                <span className="mx-2 hidden text-border sm:inline">·</span>
                <span className="mt-1 block text-foreground/80 sm:mt-0 sm:inline">
                  Factor total:{" "}
                  <span className="font-bold tabular-nums text-primary-dark">
                    {beneficiarySummary.totalFactors.toLocaleString("es-CL", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </p>
              {!sidebarOpen && isLargeScreen ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className={joinClasses("text-sm font-semibold", ui.link)}
                >
                  Mostrar filtros
                </button>
              ) : null}
            </div>

            {filteredPlans.length > 0 ? (
              <PlanResultsList
                plans={filteredPlans}
                beneficiarySummary={beneficiarySummary}
                ufToClp={UF_TO_CLP}
              />
            ) : (
              <div
                className={joinClasses(
                  "rounded-xl border border-dashed bg-white px-6 py-16 text-center shadow-card sm:px-8 sm:py-20",
                  ui.border,
                )}
              >
                <p className="text-base font-medium text-foreground">
                  Sin resultados para los filtros actuales
                </p>
                <p className="mt-1 text-sm text-muted">
                  Ajusta los filtros del panel lateral, el rango de precio o el
                  término de búsqueda.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <FiltersFab
        visible={!sidebarOpen && !isLargeScreen}
        onClick={() => setSidebarOpen(true)}
      />
    </div>
  );
}
