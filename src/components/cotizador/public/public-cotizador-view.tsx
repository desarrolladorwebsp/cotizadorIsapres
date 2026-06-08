"use client";

import { useMemo, useRef, useState } from "react";
import { FiltersFab } from "@/components/filters";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlansCatalog } from "@/hooks/use-plans-catalog";
import {
  applyDashboardFilters,
  buildPlanFinalPriceQuote,
  coverageGlobalPercentage,
  splitCoverageByType,
} from "@/domain";
import type { QuoteSortKey } from "@/lib/quote-criteria-options";
import { appShell, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { HealthPlan } from "@/domain";
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
  const { plans, loading, error } = usePlansCatalog();
  const dashboard = useCotizadorDashboard(plans);
  const resultsRef = useRef<HTMLElement>(null);

  const [criteria, setCriteria] = useState<QuoteCriteria>({
    region: "rm",
    monthlyIncome: "",
    sex: "",
  });
  const [sortKey, setSortKey] = useState<QuoteSortKey>("price_asc");
  const [currency, setCurrency] = useState<CurrencyDisplay>("clp");
  const [contractPlan, setContractPlan] = useState<HealthPlan | null>(null);
  const [search, setSearch] = useState("");

  const sortedPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = applyDashboardFilters(plans, dashboard.dashboardFilters)
      .filter((plan) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          plan.plan_name.toLowerCase().includes(normalizedSearch) ||
          plan.unique_code.toLowerCase().includes(normalizedSearch) ||
          plan.isapre.toLowerCase().includes(normalizedSearch);

        const matchesPrice =
          plan.base_price_uf >= dashboard.priceMin &&
          plan.base_price_uf <= dashboard.priceMax;

        return matchesSearch && matchesPrice;
      });

    return [...filtered].sort((a, b) => {
      if (sortKey === "coverage") {
        const scoreA = coverageScoreForPlan(a);
        const scoreB = coverageScoreForPlan(b);
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
  }, [
    plans,
    dashboard.dashboardFilters,
    dashboard.priceMin,
    dashboard.priceMax,
    dashboard.beneficiarySummary,
    dashboard.ufToClp,
    search,
    sortKey,
  ]);

  function handleCalculate() {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={joinClasses("flex min-h-screen flex-col", ui.canvas)}>
      <PublicCotizadorHeader />

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className={joinClasses(appShell, "mx-auto max-w-7xl space-y-5")}>
          <header className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary-dark sm:text-3xl">
                Planes de Isapre
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
            <PublicResultsToolbar
              resultCount={sortedPlans.length}
              sortKey={sortKey}
              onSortChange={setSortKey}
              currency={currency}
              onCurrencyChange={setCurrency}
            />

            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código o Isapre..."
                className={joinClasses(
                  "mb-4 h-11 w-full rounded-xl px-4 text-sm",
                  ui.input,
                )}
              />
            </div>

            <div className="flex min-h-0 gap-0 lg:gap-5">
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

              <div className="min-w-0 flex-1">
                {loading ? (
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
                  </div>
                ) : sortedPlans.length > 0 ? (
                  <PublicPlanResultsList
                    plans={sortedPlans}
                    beneficiarySummary={dashboard.beneficiarySummary}
                    ufToClp={dashboard.ufToClp}
                    currency={currency}
                    onRequestPlan={setContractPlan}
                  />
                ) : (
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
                )}

                {!dashboard.sidebarOpen && dashboard.isLargeScreen ? (
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
        visible={!dashboard.sidebarOpen && !dashboard.isLargeScreen}
        onClick={() => dashboard.setSidebarOpen(true)}
      />

      <ContractPlanModal
        open={contractPlan !== null}
        plan={contractPlan}
        beneficiarySummary={dashboard.beneficiarySummary}
        ufToClp={dashboard.ufToClp}
        onClose={() => setContractPlan(null)}
      />
    </div>
  );
}

function coverageScoreForPlan(plan: HealthPlan): number {
  const { hospitalaria, ambulatoria } = splitCoverageByType(plan.coverage);
  const hospital = coverageGlobalPercentage(hospitalaria);
  const ambulatory = coverageGlobalPercentage(ambulatoria);
  return (hospital + ambulatory) / 2;
}
