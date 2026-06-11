"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiltersFab } from "@/components/filters";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlanCatalogBounds } from "@/hooks/use-plan-catalog-bounds";
import { usePlanSearch } from "@/hooks/use-plan-search";
import { buildPlanFinalPriceQuote } from "@/domain";
import {
  INITIAL_PLANS_PAGE_SIZE,
  PLANS_PAGE_SIZE_STEP,
} from "@/lib/plan-search-config";
import type { QuoteSortKey } from "@/lib/quote-criteria-options";
import {
  appShell,
  appShellRoot,
  appShellScroll,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { HealthPlanSummary } from "@/domain";
import { ContractPlanModal } from "./contract-plan-modal";
import { PublicCotizadorHeader } from "./public-cotizador-header";
import { PublicFiltersSidebar } from "./public-filters-sidebar";
import { PublicPlanResultsList } from "./public-plan-results-list";
import {
  PublicQuoteCriteriaBar,
  type QuoteCriteria,
} from "./public-quote-criteria-bar";
import {
  PublicResultsToolbar,
  type CurrencyDisplay,
} from "./public-results-toolbar";

export function PublicCotizadorView() {
  const dashboard = useCotizadorDashboard([]);
  const { bounds } = usePlanCatalogBounds();
  const { plans, total, loading, error, hasSearched, search } = usePlanSearch();
  const resultsRef = useRef<HTMLElement>(null);
  const initialSearchDoneRef = useRef(false);
  const skipDebouncedSearchRef = useRef(false);

  const [criteria, setCriteria] = useState<QuoteCriteria>({
    region: "rm",
    monthlyIncome: "",
    sex: "",
  });
  const [sortKey, setSortKey] = useState<QuoteSortKey>("price_asc");
  const [currency, setCurrency] = useState<CurrencyDisplay>("clp");
  const [contractPlan, setContractPlan] = useState<HealthPlanSummary | null>(
    null,
  );
  const [searchText, setSearchText] = useState("");
  const [resultsLimit, setResultsLimit] = useState(INITIAL_PLANS_PAGE_SIZE);

  const runSearch = useCallback(
    (limit = resultsLimit) => {
      void search({
        q: searchText,
        priceMin: dashboard.priceMin,
        priceMax: dashboard.priceMax,
        filters: dashboard.dashboardFilters,
        limit,
      });
    },
    [
      search,
      searchText,
      dashboard.priceMin,
      dashboard.priceMax,
      dashboard.dashboardFilters,
      resultsLimit,
    ],
  );

  useEffect(() => {
    if (initialSearchDoneRef.current || bounds.totalPlans === 0) return;

    dashboard.setPriceMin(Math.floor(bounds.priceMin * 10) / 10);
    dashboard.setPriceMax(Math.ceil(bounds.priceMax * 10) / 10);
    initialSearchDoneRef.current = true;
    skipDebouncedSearchRef.current = true;

    void search({
      priceMin: Math.floor(bounds.priceMin * 10) / 10,
      priceMax: Math.ceil(bounds.priceMax * 10) / 10,
      filters: dashboard.dashboardFilters,
      limit: INITIAL_PLANS_PAGE_SIZE,
    });
  }, [
    bounds.totalPlans,
    bounds.priceMin,
    bounds.priceMax,
    dashboard.dashboardFilters,
    dashboard.setPriceMin,
    dashboard.setPriceMax,
    search,
  ]);

  useEffect(() => {
    if (!hasSearched || skipDebouncedSearchRef.current) {
      skipDebouncedSearchRef.current = false;
      return;
    }

    setResultsLimit(INITIAL_PLANS_PAGE_SIZE);
    const timer = window.setTimeout(() => {
      void search({
        q: searchText,
        priceMin: dashboard.priceMin,
        priceMax: dashboard.priceMax,
        filters: dashboard.dashboardFilters,
        limit: INITIAL_PLANS_PAGE_SIZE,
      });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [
    hasSearched,
    search,
    dashboard.dashboardFilters,
    dashboard.priceMin,
    dashboard.priceMax,
    searchText,
  ]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (sortKey === "coverage") {
        const scoreA =
          (a.coverage_summary.hospital_avg + a.coverage_summary.ambulatory_avg) /
          2;
        const scoreB =
          (b.coverage_summary.hospital_avg + b.coverage_summary.ambulatory_avg) /
          2;
        return scoreB - scoreA;
      }

      const priceA = buildPlanFinalPriceQuote(
        a.base_price_uf,
        dashboard.beneficiarySummary,
        dashboard.ufToClp,
      ).finalPriceUf;
      const priceB = buildPlanFinalPriceQuote(
        b.base_price_uf,
        dashboard.beneficiarySummary,
        dashboard.ufToClp,
      ).finalPriceUf;

      return sortKey === "price_asc" ? priceA - priceB : priceB - priceA;
    });
  }, [plans, sortKey, dashboard.beneficiarySummary, dashboard.ufToClp]);

  const hasMoreResults = total > plans.length;

  function handleCalculate() {
    setResultsLimit(INITIAL_PLANS_PAGE_SIZE);
    skipDebouncedSearchRef.current = true;
    void search({
      q: searchText,
      priceMin: dashboard.priceMin,
      priceMax: dashboard.priceMax,
      filters: dashboard.dashboardFilters,
      limit: INITIAL_PLANS_PAGE_SIZE,
    });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLoadMore() {
    const nextLimit = resultsLimit + PLANS_PAGE_SIZE_STEP;
    setResultsLimit(nextLimit);
    skipDebouncedSearchRef.current = true;
    void search({
      q: searchText,
      priceMin: dashboard.priceMin,
      priceMax: dashboard.priceMax,
      filters: dashboard.dashboardFilters,
      limit: nextLimit,
    });
  }

  return (
    <div className={joinClasses(appShellRoot, ui.canvas)}>
      <PublicCotizadorHeader />

      <main
        className={joinClasses(
          appShellScroll,
          safeWidth,
          "px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
        )}
      >
        <div className={joinClasses(appShell, safeWidth, "space-y-5")}>
          <header className={joinClasses(safeWidth, "motion-safe-fade-in space-y-2")}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Cotizador en línea
            </p>
            <div className={joinClasses(safeWidth, "flex items-center gap-2")}>
              <h1 className="text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
                Encuentra tu plan de salud
              </h1>
              <span
                className="rounded-md bg-primary/10 px-2 py-1 text-primary-dark"
                title="Información de planes"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" fill="none" className="size-4">
                  <path
                    d="M12 16v-4M12 8h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            <p className="text-sm text-muted">
              Planes de Isapre con precios directos y sin costo adicional
            </p>
          </header>

          <PublicQuoteCriteriaBar
            criteria={criteria}
            onCriteriaChange={(patch) =>
              setCriteria((current) => ({ ...current, ...patch }))
            }
            beneficiaries={dashboard.beneficiaries}
            onBeneficiariesChange={dashboard.handleBeneficiariesChange}
            onCalculate={handleCalculate}
          />

          <section
            id="resultados"
            ref={resultsRef}
            className="scroll-mt-24 space-y-4"
          >
            {hasSearched ? (
              <PublicResultsToolbar
                displayedCount={sortedPlans.length}
                totalCount={total}
                sortKey={sortKey}
                onSortChange={setSortKey}
                currency={currency}
                onCurrencyChange={setCurrency}
              />
            ) : null}

            {hasSearched ? (
              <div className={joinClasses(safeWidth, "relative")}>
                <input
                  type="search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar por nombre, código o Isapre..."
                  className={joinClasses(
                    "mb-4 h-11 w-full max-w-full rounded-xl px-4 text-sm",
                    ui.input,
                  )}
                />
              </div>
            ) : null}

            <div className={joinClasses(safeWidth, "flex min-h-0 gap-0 lg:gap-5")}>
              {hasSearched ? (
                <PublicFiltersSidebar
                  open={dashboard.sidebarOpen}
                  onClose={() => dashboard.setSidebarOpen(false)}
                  priceMin={dashboard.priceMin}
                  priceMax={dashboard.priceMax}
                  ufToClp={dashboard.ufToClp}
                  onPriceMinChange={dashboard.setPriceMin}
                  onPriceMaxChange={dashboard.setPriceMax}
                  filters={dashboard.dashboardFilters}
                  onFiltersChange={dashboard.setDashboardFilters}
                />
              ) : null}

              <div className="min-w-0 flex-1">
                {loading || !hasSearched ? (
                  <div
                    className={joinClasses(
                      "rounded-2xl border bg-white px-6 py-16 text-center",
                      ui.border,
                    )}
                  >
                    <p className="text-sm text-muted">Cargando planes…</p>
                  </div>
                ) : error ? (
                  <div
                    className={joinClasses(
                      "rounded-2xl border border-dashed bg-white px-6 py-16 text-center",
                      ui.border,
                    )}
                  >
                    <p className="font-medium">{error}</p>
                    <button
                      type="button"
                      onClick={() => runSearch()}
                      className={joinClasses(
                        "mt-4 text-sm font-semibold",
                        ui.link,
                      )}
                    >
                      Reintentar búsqueda
                    </button>
                  </div>
                ) : sortedPlans.length > 0 ? (
                  <>
                    <PublicPlanResultsList
                      plans={sortedPlans}
                      beneficiarySummary={dashboard.beneficiarySummary}
                      ufToClp={dashboard.ufToClp}
                      currency={currency}
                      onRequestPlan={setContractPlan}
                    />
                    {hasMoreResults ? (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          className={joinClasses(
                            touchTarget,
                            "rounded-full border px-8 text-sm font-semibold text-primary-dark transition hover:border-primary/40 hover:bg-primary/5",
                            ui.border,
                          )}
                        >
                          Ver más planes (
                          {Math.min(
                            PLANS_PAGE_SIZE_STEP,
                            total - plans.length,
                          )}{" "}
                          adicionales)
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : hasSearched ? (
                  <div
                    className={joinClasses(
                      "rounded-2xl border border-dashed bg-white px-6 py-16 text-center",
                      ui.border,
                    )}
                  >
                    <p className="font-medium text-foreground">
                      Sin resultados para los filtros actuales
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Ajusta el rango de precio o los filtros laterales.
                    </p>
                    <button
                      type="button"
                      onClick={() => dashboard.setSidebarOpen(true)}
                      className={joinClasses(
                        "mt-4 text-sm font-semibold",
                        ui.link,
                      )}
                    >
                      Abrir filtros
                    </button>
                  </div>
                ) : null}

                {hasSearched &&
                !dashboard.sidebarOpen &&
                dashboard.isLargeScreen ? (
                  <button
                    type="button"
                    onClick={() => dashboard.setSidebarOpen(true)}
                    className={joinClasses(
                      touchTarget,
                      "mt-4 text-sm font-semibold",
                      ui.link,
                    )}
                  >
                    Mostrar filtros
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      <FiltersFab
        visible={
          hasSearched && !dashboard.sidebarOpen && !dashboard.isLargeScreen
        }
        onClick={() => dashboard.setSidebarOpen(true)}
      />

      <ContractPlanModal
        open={contractPlan !== null}
        planSummary={contractPlan}
        beneficiarySummary={dashboard.beneficiarySummary}
        dependents={dashboard.beneficiaries.dependents}
        ufToClp={dashboard.ufToClp}
        criteria={criteria}
        onClose={() => setContractPlan(null)}
      />
    </div>
  );
}
