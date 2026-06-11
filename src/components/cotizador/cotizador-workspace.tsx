"use client";

import { FiltersFab, FiltersSidebar } from "@/components/filters";
import { PlanResultsList } from "@/components/plan-card";
import { CotizadorHeader, type CotizadorHeaderVariant } from "@/components/cotizador/cotizador-header";
import { CotizadorNav } from "@/components/cotizador/cotizador-nav";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlansCatalog } from "@/hooks/use-plans-catalog";
import { formatPlanClp, formatPlanUf } from "@/domain";
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
}

export function CotizadorWorkspace({ variant }: CotizadorWorkspaceProps) {
  const { plans, loading, error } = usePlansCatalog();
  const dashboard = useCotizadorDashboard(plans);

  return (
    <div className={joinClasses(appShellRoot, ui.canvas)}>
      <CotizadorHeader
        variant={variant}
        sidebarOpen={dashboard.sidebarOpen}
        onToggleSidebar={() => dashboard.setSidebarOpen((open) => !open)}
      />
      <CotizadorNav />

      <div className={joinClasses(appShellScroll, safeWidth, "flex min-h-0")}>
        {dashboard.sidebarReady ? (
          <FiltersSidebar
            open={dashboard.sidebarOpen}
            onClose={() => dashboard.setSidebarOpen(false)}
            beneficiaries={dashboard.beneficiaries}
            onBeneficiariesChange={dashboard.handleBeneficiariesChange}
            filters={dashboard.dashboardFilters}
            onFiltersChange={dashboard.setDashboardFilters}
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
                    value={dashboard.search}
                    onChange={(event) => dashboard.setSearch(event.target.value)}
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
                    {formatPlanUf(dashboard.priceMin)} –{" "}
                    {formatPlanUf(dashboard.priceMax)}
                  </span>
                </div>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={dashboard.priceMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      dashboard.setPriceMin(Math.min(value, dashboard.priceMax));
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white md:[&::-webkit-slider-thumb]:size-4"
                  />
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={dashboard.priceMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      dashboard.setPriceMax(Math.max(value, dashboard.priceMin));
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-white md:[&::-webkit-slider-thumb]:size-4"
                  />
                </div>
                <p className="text-[11px] text-muted/80">
                  Aprox. {formatPlanClp(dashboard.priceMin * dashboard.ufToClp)}{" "}
                  – {formatPlanClp(dashboard.priceMax * dashboard.ufToClp)} en
                  pesos
                </p>
              </div>

              <button
                type="button"
                onClick={() => dashboard.setSortAsc((value) => !value)}
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
                {dashboard.sortAsc ? "Menor a Mayor" : "Mayor a Menor"}
              </button>
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
    </div>
  );
}
