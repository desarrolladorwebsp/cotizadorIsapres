"use client";

import { useCallback, useMemo, useState } from "react";
import { FiltersFab, FiltersSidebar } from "@/components/filters";
import { CompanyAgreementValidationSection } from "@/components/cotizador/company-agreement";
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
  getActiveClinicIds,
} from "@/domain";
import { createDefaultQuoteCriteria } from "@/lib/quote-criteria-options";
import type { HealthPlan } from "@/domain";
import {
  appShell,
  appShellRoot,
  appShellScroll,
  safeWidth,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface CotizadorWorkspaceProps {
  variant: CotizadorHeaderVariant;
  /** Oculta header y nav globales cuando el panel ejecutivo ya provee la navegación. */
  embeddedInExecutiveShell?: boolean;
  onNotify?: (message: string, tone?: "success" | "error") => void;
}

export function CotizadorWorkspace({
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
  const [assignPlan, setAssignPlan] = useState<HealthPlan | null>(null);
  const [region, setRegion] = useState(defaultRegion);
  const isExecutive = variant === "executive";

  const handleRegionChange = useCallback(
    (nextRegion: string) => {
      setRegion(nextRegion);
      dashboard.setDashboardFilters((currentFilters) =>
        applyRegionToDashboardFilters(currentFilters, nextRegion),
      );
    },
    [dashboard.setDashboardFilters],
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
            sidebarOpen={dashboard.sidebarOpen}
            onToggleSidebar={() => dashboard.setSidebarOpen((open) => !open)}
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
          {dashboard.sidebarReady ? (
            <FiltersSidebar
              open={dashboard.sidebarOpen}
              onClose={() => dashboard.setSidebarOpen(false)}
              beneficiaries={dashboard.beneficiaries}
              onBeneficiariesChange={dashboard.handleBeneficiariesChange}
              filters={dashboard.dashboardFilters}
              onFiltersChange={dashboard.handleDashboardFiltersChange}
              priceMin={dashboard.priceMin}
              priceMax={dashboard.priceMax}
              ufToClp={dashboard.ufToClp}
              onPriceMinChange={dashboard.handlePriceMinChange}
              onPriceMaxChange={dashboard.handlePriceMaxChange}
              defaultPriceMin={defaultPriceBounds.min}
              defaultPriceMax={defaultPriceBounds.max}
              hideHelperText={embeddedInExecutiveShell}
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
                "grid gap-5 rounded-xl border bg-white p-4 shadow-card sm:gap-6 sm:p-6",
                "md:grid-cols-2 md:items-end",
                ui.border,
              )}
            >
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
                    value={dashboard.search}
                    onChange={(event) =>
                      dashboard.handleSearchChange(event.target.value)
                    }
                    placeholder="Nombre, código o Isapre..."
                    className={joinClasses(
                      "h-12 w-full rounded-lg py-2 pl-10 pr-4 text-base md:h-11 md:text-sm",
                      ui.input,
                    )}
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                <span className="font-bold text-primary-dark">
                  {dashboard.filteredPlans.length}
                </span>{" "}
                planes encontrados
                <span className="mx-2 hidden text-border sm:inline">·</span>
                <span className="mt-1 block text-foreground/80 sm:mt-0 sm:inline">
                  Factor total:{" "}
                  <span className="font-bold tabular-nums text-primary-dark">
                    {dashboard.beneficiarySummary.totalFactors.toLocaleString(
                      "es-CL",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </span>
                </span>
              </p>
              {!dashboard.sidebarOpen && dashboard.isLargeScreen ? (
                <button
                  type="button"
                  onClick={() => dashboard.setSidebarOpen(true)}
                  className={joinClasses("text-sm font-semibold", ui.link)}
                >
                  Mostrar filtros
                </button>
              ) : null}
            </div>

            <CompanyAgreementValidationSection source="executive" />

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
            ) : dashboard.filteredPlans.length > 0 ? (
              <PlanResultsList
                plans={dashboard.filteredPlans}
                beneficiarySummary={dashboard.beneficiarySummary}
                ufToClp={dashboard.ufToClp}
                highlightClinicIds={getActiveClinicIds(dashboard.dashboardFilters)}
                onAssignPlan={
                  isExecutive ? (plan) => setAssignPlan(plan) : undefined
                }
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
        visible={!dashboard.sidebarOpen && !dashboard.isLargeScreen}
        onClick={() => dashboard.setSidebarOpen(true)}
      />

      {isExecutive ? (
        <AssignPlanToClientModal
          plan={assignPlan}
          beneficiarySummary={dashboard.beneficiarySummary}
          ufToClp={dashboard.ufToClp}
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
