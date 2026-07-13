"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiltersFab, FiltersSidebar } from "@/components/filters";
import {
  CompanyAgreementProvider,
  CompanyAgreementValidationSection,
} from "@/components/cotizador/company-agreement";
import { RegionFilterSelect } from "@/components/filters/region-filter-select";
import { PlanResultsList } from "@/components/plan-card";
import { CotizadorHeader, type CotizadorHeaderVariant } from "@/components/cotizador/cotizador-header";
import { CotizadorNav } from "@/components/cotizador/cotizador-nav";
import { AssignPlanToClientModal } from "@/components/executive/assign-plan-to-client-modal";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlansCatalog } from "@/hooks/use-plans-catalog";
import {
  applyRegionToDashboardFilters,
  createDefaultDashboardFilters,
  getActiveAmbulatoryClinicIds,
  getActiveHospitalClinicIds,
} from "@/domain";
import { comparePlansByFinalPriceAsc } from "@/lib/plan-sort";
import {
  INITIAL_PLANS_PAGE_SIZE,
  PLANS_PAGE_SIZE_STEP,
} from "@/lib/plan-search-config";
import {
  createDefaultQuoteCriteria,
  SORT_OPTIONS,
  type QuoteSortKey,
} from "@/lib/quote-criteria-options";
import type { HealthPlan } from "@/domain";
import {
  appShell,
  appShellRoot,
  appShellScroll,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface CotizadorWorkspaceProps {
  variant: CotizadorHeaderVariant;
  /** Oculta header y nav globales cuando el panel ejecutivo ya provee la navegación. */
  embeddedInExecutiveShell?: boolean;
  onNotify?: (message: string, tone?: "success" | "error") => void;
}

export function CotizadorWorkspace(props: CotizadorWorkspaceProps) {
  return (
    <CompanyAgreementProvider>
      <CotizadorWorkspaceInner {...props} />
    </CompanyAgreementProvider>
  );
}

function CotizadorWorkspaceInner({
  variant,
  embeddedInExecutiveShell = false,
  onNotify,
}: CotizadorWorkspaceProps) {
  const { plans, loading, error } = usePlansCatalog();
  const defaultRegion = createDefaultQuoteCriteria().region;
  const dashboard = useCotizadorDashboard(plans, {
    initialDashboardFilters: applyRegionToDashboardFilters(
      createDefaultDashboardFilters(),
      defaultRegion,
    ),
  });
  const {
    setPriceMin,
    setPriceMax,
    setDashboardFilters,
    filteredPlans,
    sidebarOpen,
    setSidebarOpen,
    sidebarReady,
    search,
    handleSearchChange,
    priceMin,
    priceMax,
    handlePriceMinChange,
    handlePriceMaxChange,
    beneficiaries,
    handleBeneficiariesChange,
    beneficiarySummary,
    dashboardFilters,
    handleDashboardFiltersChange,
    isLargeScreen,
    ufToClp,
  } = dashboard;
  const [assignPlan, setAssignPlan] = useState<HealthPlan | null>(null);
  const [region, setRegion] = useState(defaultRegion);
  const [sortKey, setSortKey] = useState<QuoteSortKey>("price_asc");
  const [visibleCount, setVisibleCount] = useState(INITIAL_PLANS_PAGE_SIZE);
  const [priceBoundsInitialized, setPriceBoundsInitialized] = useState(false);
  const isExecutive = variant === "executive";

  const displayedPlans = useMemo(() => {
    const plans = [...filteredPlans];

    if (sortKey === "price_desc") {
      return plans.sort((a, b) =>
        -comparePlansByFinalPriceAsc(a, b, beneficiarySummary, ufToClp),
      );
    }

    if (sortKey === "coverage") {
      const coverageScore = (plan: HealthPlan) => {
        if (plan.coverage.length === 0) return 0;
        return (
          plan.coverage.reduce((sum, entry) => sum + entry.percentage, 0) /
          plan.coverage.length
        );
      };

      return plans.sort((a, b) => {
        const diff = coverageScore(b) - coverageScore(a);
        if (diff !== 0) return diff;
        return comparePlansByFinalPriceAsc(a, b, beneficiarySummary, ufToClp);
      });
    }

    return plans;
  }, [filteredPlans, sortKey, beneficiarySummary, ufToClp]);

  const visiblePlans = useMemo(
    () => displayedPlans.slice(0, visibleCount),
    [displayedPlans, visibleCount],
  );

  const hasMorePlans = displayedPlans.length > visiblePlans.length;

  const resultsFingerprint = useMemo(
    () =>
      [
        search,
        sortKey,
        priceMin,
        priceMax,
        region,
        displayedPlans.length,
        beneficiarySummary.totalFactors,
      ].join("|"),
    [
      search,
      sortKey,
      priceMin,
      priceMax,
      region,
      displayedPlans.length,
      beneficiarySummary.totalFactors,
    ],
  );

  useEffect(() => {
    setVisibleCount(INITIAL_PLANS_PAGE_SIZE);
  }, [resultsFingerprint]);

  function handleLoadMorePlans() {
    setVisibleCount((current) =>
      Math.min(current + PLANS_PAGE_SIZE_STEP, displayedPlans.length),
    );
  }

  const handleRegionChange = useCallback(
    (nextRegion: string) => {
      setRegion(nextRegion);
      setDashboardFilters((currentFilters) =>
        applyRegionToDashboardFilters(currentFilters, nextRegion),
      );
    },
    [setDashboardFilters],
  );

  function notify(message: string, tone: "success" | "error" = "success") {
    onNotify?.(message, tone);
  }

  const defaultPriceBounds = useMemo(() => {
    if (plans.length === 0) {
      return { min: 2, max: 8 };
    }

    let min = plans[0].base_price_uf;
    let max = plans[0].base_price_uf;
    for (const plan of plans) {
      if (plan.base_price_uf < min) min = plan.base_price_uf;
      if (plan.base_price_uf > max) max = plan.base_price_uf;
    }

    return {
      min: Math.floor(min * 10) / 10,
      max: Math.ceil(max * 10) / 10,
    };
  }, [plans]);

  useEffect(() => {
    if (!isExecutive || priceBoundsInitialized || plans.length === 0) return;
    setPriceMin(defaultPriceBounds.min);
    setPriceMax(defaultPriceBounds.max);
    setPriceBoundsInitialized(true);
  }, [
    isExecutive,
    priceBoundsInitialized,
    plans.length,
    defaultPriceBounds.min,
    defaultPriceBounds.max,
    setPriceMin,
    setPriceMax,
  ]);

  return (
    <div
      className={joinClasses(
        embeddedInExecutiveShell ? "flex min-h-0 flex-1 flex-col" : appShellRoot,
        !embeddedInExecutiveShell && ui.canvas,
      )}
    >
      {!embeddedInExecutiveShell ? (
        <>
          <CotizadorHeader
            variant={variant}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          />
          <CotizadorNav />
        </>
      ) : null}

      <div
        className={joinClasses(
          embeddedInExecutiveShell
            ? "flex min-h-0 flex-1 flex-col"
            : appShellScroll,
          safeWidth,
          !embeddedInExecutiveShell && "flex min-h-0 flex-col",
          embeddedInExecutiveShell && "flex min-h-0 flex-1 flex-col",
        )}
      >
        <div
          className={joinClasses(
            "flex w-full min-w-0 flex-1 flex-col lg:flex-row lg:items-start",
          )}
        >
          {sidebarReady ? (
            <FiltersSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              beneficiaries={beneficiaries}
              onBeneficiariesChange={handleBeneficiariesChange}
              filters={dashboardFilters}
              onFiltersChange={handleDashboardFiltersChange}
              priceMin={priceMin}
              priceMax={priceMax}
              ufToClp={ufToClp}
              onPriceMinChange={handlePriceMinChange}
              onPriceMaxChange={handlePriceMaxChange}
              defaultPriceMin={defaultPriceBounds.min}
              defaultPriceMax={defaultPriceBounds.max}
              hideHelperText={embeddedInExecutiveShell}
              executiveVisual={embeddedInExecutiveShell}
            />
          ) : null}

          <main
            className={joinClasses(
              safeWidth,
              "min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10",
            )}
          >
          <div
            className={joinClasses(
              appShell,
              safeWidth,
              "flex flex-col gap-6 sm:gap-8 xl:gap-10",
            )}
          >
            {variant === "client" ? (
              <section
                className={joinClasses(
                  "rounded-xl border bg-white p-5 shadow-card sm:p-6",
                  ui.border,
                )}
              >
                <h1 className="text-xl font-bold text-primary-dark sm:text-2xl">
                  Encuentra el plan ideal para ti
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  Compara coberturas, precios en UF y pesos chilenos, y contrata
                  en línea según el perfil de tu grupo familiar.
                </p>
              </section>
            ) : null}

            <section
              className={joinClasses(
                "rounded-xl border bg-white p-4 shadow-card sm:p-6",
                ui.border,
              )}
            >
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 md:items-end">
                <RegionFilterSelect
                  id="executive-plan-region"
                  value={region}
                  onChange={handleRegionChange}
                />

                <div className="space-y-2">
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
                      onChange={(event) =>
                        handleSearchChange(event.target.value)
                      }
                      placeholder="Nombre, código o Isapre..."
                      className={joinClasses(
                        "h-12 w-full rounded-lg py-2 pl-10 pr-4 text-base md:h-11 md:text-sm",
                        ui.input,
                      )}
                    />
                  </div>
                </div>
              </div>

              <CompanyAgreementValidationSection
                variant="inline"
                source="executive"
              />
            </section>

            <section
              className={joinClasses(
                "flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 shadow-card sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5 sm:py-3.5",
                ui.border,
              )}
            >
              <p className="text-sm text-muted">
                <span className="font-bold text-primary-dark">
                  {displayedPlans.length}
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

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label
                  htmlFor="plan-sort"
                  className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
                >
                  <span className="shrink-0 text-xs font-medium text-muted">
                    Ordenar por
                  </span>
                  <select
                    id="plan-sort"
                    value={sortKey}
                    onChange={(event) =>
                      setSortKey(event.target.value as QuoteSortKey)
                    }
                    className={joinClasses(
                      "h-10 min-w-0 flex-1 rounded-lg px-3 text-sm sm:min-w-[11rem] sm:flex-none",
                      ui.input,
                    )}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {!sidebarOpen && isLargeScreen ? (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className={joinClasses(
                      "h-10 shrink-0 rounded-lg border px-3.5 text-sm font-semibold transition",
                      ui.border,
                      "text-primary-dark hover:bg-primary/5",
                    )}
                  >
                    Mostrar filtros
                  </button>
                ) : null}
              </div>
            </section>

            {loading ? (
              <div
                className={joinClasses(
                  "rounded-xl border bg-white px-6 py-16 text-center shadow-card",
                  ui.border,
                )}
              >
                <p className="text-sm text-muted">Cargando planes…</p>
              </div>
            ) : error ? (
              <div
                className={joinClasses(
                  "rounded-xl border border-dashed bg-white px-6 py-16 text-center shadow-card",
                  ui.border,
                )}
              >
                <p className="text-base font-medium text-foreground">{error}</p>
              </div>
            ) : displayedPlans.length > 0 ? (
              <>
                <PlanResultsList
                  plans={visiblePlans}
                  beneficiarySummary={beneficiarySummary}
                  ufToClp={ufToClp}
                  highlightHospitalClinicIds={getActiveHospitalClinicIds(
                    dashboardFilters,
                  )}
                  highlightAmbulatoryClinicIds={getActiveAmbulatoryClinicIds(
                    dashboardFilters,
                  )}
                  onAssignPlan={
                    isExecutive ? (plan) => setAssignPlan(plan) : undefined
                  }
                />
                {hasMorePlans ? (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMorePlans}
                      className={joinClasses(
                        touchTarget,
                        "rounded-full border px-8 text-sm font-semibold text-primary-dark transition hover:border-primary/40 hover:bg-primary/5",
                        ui.border,
                      )}
                    >
                      Ver más planes (
                      {Math.min(
                        PLANS_PAGE_SIZE_STEP,
                        displayedPlans.length - visiblePlans.length,
                      )}{" "}
                      adicionales)
                    </button>
                  </div>
                ) : null}
              </>
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

      {isExecutive ? (
        <AssignPlanToClientModal
          plan={assignPlan}
          beneficiarySummary={beneficiarySummary}
          ufToClp={ufToClp}
          open={Boolean(assignPlan)}
          onClose={() => setAssignPlan(null)}
          onAssigned={() => undefined}
          onNotify={notify}
        />
      ) : null}
      </div>
    </div>
  );
}
