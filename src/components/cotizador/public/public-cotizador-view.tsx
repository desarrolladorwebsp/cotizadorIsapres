"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiltersFab } from "@/components/filters";
import {
  PartnerEntityProvider,
  usePartnerEntity,
} from "@/components/partner/partner-entity-provider";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlanCatalogBounds } from "@/hooks/use-plan-catalog-bounds";
import { usePlanSearch } from "@/hooks/use-plan-search";
import { buildPlanFinalPriceQuote } from "@/domain";
import { parseCotizadorUrl } from "@/lib/deep-link/parse-cotizador-url";
import {
  SOLICITAR_DEEP_LINK_RECOVERY_MS,
  SOLICITAR_RECOVERY_NOTICE,
  stripSolicitarParamsFromBrowserUrl,
} from "@/lib/deep-link/solicitar-recovery";
import { mapHealthPlanToSummary } from "@/lib/api/plan-summary";
import { primePlanDetailCache } from "@/hooks/use-plan-detail";
import { notifyCotizacionByEmail } from "@/lib/cotizacion-notify/client";
import {
  INITIAL_PLANS_PAGE_SIZE,
  PLANS_PAGE_SIZE_STEP,
} from "@/lib/plan-search-config";
import type { QuoteSortKey } from "@/lib/quote-criteria-options";
import {
  appShellRoot,
  appShellScroll,
  publicCotizadorShell,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { HealthPlanSummary } from "@/domain";
import type { HealthPlan } from "@/types/plan";
import type { PartnerEntityPublic } from "@/types/partner-entity";
import { ContractPlanModal } from "./contract-plan-modal";
import { PublicCotizadorNotice } from "./public-cotizador-notice";
import { PublicCotizadorHeader } from "./public-cotizador-header";
import { PublicWhatsAppFab } from "./public-whatsapp-fab";
import { PublicFiltersSidebar } from "./public-filters-sidebar";
import { PublicPlanResultsList } from "./public-plan-results-list";
import {
  PublicPlanResultsLoading,
  PublicPlanResultsLoadingInline,
} from "./public-plan-results-loading";
import {
  PublicQuoteCriteriaBar,
  type QuoteCriteria,
} from "./public-quote-criteria-bar";
import {
  PublicResultsToolbar,
  type CurrencyDisplay,
} from "./public-results-toolbar";

export interface PublicCotizadorViewProps {
  entity?: PartnerEntityPublic | null;
}

export function PublicCotizadorView({
  entity = null,
}: PublicCotizadorViewProps) {
  return (
    <PartnerEntityProvider entity={entity}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-bg-layout text-sm text-muted">
            Cargando cotizador…
          </div>
        }
      >
        <PublicCotizadorViewInner />
      </Suspense>
    </PartnerEntityProvider>
  );
}

function PublicCotizadorViewInner() {
  const searchParams = useSearchParams();
  const deepLinkParamKey = searchParams.toString();
  const deepLink = useMemo(
    () => parseCotizadorUrl(searchParams),
    [searchParams],
  );

  const { entity, isBranded, themeStyle } = usePartnerEntity();
  const dashboard = useCotizadorDashboard([], {
    initialBeneficiaries: deepLink.beneficiaries,
    initialBeneficiarySummary: deepLink.beneficiarySummary,
    initialDashboardFilters: deepLink.filters,
    initialPriceMin: deepLink.priceMin,
    initialPriceMax: deepLink.priceMax,
  });
  const { bounds, loading: boundsLoading } = usePlanCatalogBounds();
  const { plans, total, loading, error, hasSearched, search, resetSearchCache } =
    usePlanSearch();
  const resultsRef = useRef<HTMLElement>(null);
  const initialSearchDoneRef = useRef(false);
  const skipDebouncedSearchRef = useRef(false);
  const solicitarFetchStartedRef = useRef<string | null>(null);
  const solicitarRecoveryDoneRef = useRef(false);
  const [formReady, setFormReady] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const [solicitarFlowActive, setSolicitarFlowActive] = useState(
    () => deepLink.hasSolicitarDeepLink,
  );

  const [criteria, setCriteria] = useState<QuoteCriteria>(deepLink.criteria);
  const [sortKey, setSortKey] = useState<QuoteSortKey>(
    deepLink.sortKey ?? "price_asc",
  );
  const [currency, setCurrency] = useState<CurrencyDisplay>(
    deepLink.currency ?? "clp",
  );
  const [contractPlan, setContractPlan] = useState<HealthPlanSummary | null>(
    null,
  );
  const [contractModalTab, setContractModalTab] = useState<
    "overview" | "price" | "request" | undefined
  >(deepLink.modalTab);
  const [searchText, setSearchText] = useState(deepLink.q ?? "");
  const [resultsLimit, setResultsLimit] = useState(INITIAL_PLANS_PAGE_SIZE);
  const [notifyEmail, setNotifyEmail] = useState(deepLink.email ?? "");
  const searchNotifySentRef = useRef(false);

  useEffect(() => {
    if (deepLink.hasDeepLinkParams || deepLink.hasSolicitarDeepLink) {
      setCriteria(deepLink.criteria);
      setSearchText(deepLink.q ?? deepLink.planCode ?? "");
      if (deepLink.sortKey) setSortKey(deepLink.sortKey);
      if (deepLink.currency) setCurrency(deepLink.currency);
      if (deepLink.email) setNotifyEmail(deepLink.email);
      if (deepLink.modalTab) setContractModalTab(deepLink.modalTab);
      searchNotifySentRef.current = false;

      dashboard.handleBeneficiariesChange(
        deepLink.beneficiaries,
        deepLink.beneficiarySummary,
      );
      dashboard.setDashboardFilters(deepLink.filters);

      if (deepLink.priceMin !== undefined) {
        dashboard.setPriceMin(deepLink.priceMin);
      }
      if (deepLink.priceMax !== undefined) {
        dashboard.setPriceMax(deepLink.priceMax);
      }

      initialSearchDoneRef.current = false;
      solicitarFetchStartedRef.current = null;
      solicitarRecoveryDoneRef.current = false;
      setRecoveryNotice(null);
      setSolicitarFlowActive(deepLink.hasSolicitarDeepLink);
      resetSearchCache();
    }

    setFormReady(true);
  }, [
    deepLinkParamKey,
    deepLink,
    dashboard.handleBeneficiariesChange,
    resetSearchCache,
  ]);

  const runSearch = useCallback(
    (limit = resultsLimit, options?: { force?: boolean }) => {
      return search(
        {
          q: searchText,
          priceMin: dashboard.priceMin,
          priceMax: dashboard.priceMax,
          filters: dashboard.dashboardFilters,
          limit,
        },
        options,
      );
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

  const sendSearchCotizacionNotify = useCallback(async () => {
    if (!notifyEmail.trim() || searchNotifySentRef.current) return;
    if (dashboard.beneficiarySummary.contributor.age === null) return;

    searchNotifySentRef.current = true;

    try {
      await notifyCotizacionByEmail({
        email: notifyEmail,
        criteria,
        beneficiarySummary: dashboard.beneficiarySummary,
        filters: dashboard.dashboardFilters,
        searchText,
        sortKey,
        currency,
        deepLink,
        partnerEntitySlug: entity?.slug ?? deepLink.entidad ?? null,
        partnerEntityName: entity?.name ?? null,
      });
    } catch (error) {
      searchNotifySentRef.current = false;
      console.error("No se pudo enviar la notificación de cotización:", error);
    }
  }, [
    notifyEmail,
    criteria,
    dashboard.beneficiarySummary,
    dashboard.dashboardFilters,
    searchText,
    sortKey,
    currency,
    deepLink,
    entity?.slug,
    entity?.name,
  ]);

  useEffect(() => {
    if (!formReady || boundsLoading || initialSearchDoneRef.current) {
      return;
    }

    const priceMin =
      deepLink.priceMin ??
      (bounds.totalPlans > 0 ? Math.floor(bounds.priceMin * 10) / 10 : 0);
    const priceMax =
      deepLink.priceMax ??
      (bounds.totalPlans > 0 ? Math.ceil(bounds.priceMax * 10) / 10 : 20);

    dashboard.setPriceMin(priceMin);
    dashboard.setPriceMax(priceMax);
    initialSearchDoneRef.current = true;
    skipDebouncedSearchRef.current = true;

    if (!deepLink.shouldAutoSearch) return;

    const filters = deepLink.hasDeepLinkParams
      ? deepLink.filters
      : dashboard.dashboardFilters;

    void search(
      {
        q: deepLink.q ?? deepLink.planCode,
        priceMin,
        priceMax,
        filters,
        limit: INITIAL_PLANS_PAGE_SIZE,
      },
      { force: true },
    ).then(() => {
      void sendSearchCotizacionNotify();
      if (deepLink.hasDeepLinkParams) {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }, [
    formReady,
    boundsLoading,
    bounds.totalPlans,
    bounds.priceMin,
    bounds.priceMax,
    dashboard.dashboardFilters,
    dashboard.setPriceMin,
    dashboard.setPriceMax,
    deepLink.filters,
    deepLink.hasDeepLinkParams,
    deepLink.planCode,
    deepLink.priceMax,
    deepLink.priceMin,
    deepLink.q,
    deepLink.shouldAutoSearch,
    search,
    sendSearchCotizacionNotify,
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
          (a.coverage_summary.hospital_avg +
            a.coverage_summary.ambulatory_avg) /
          2;
        const scoreB =
          (b.coverage_summary.hospital_avg +
            b.coverage_summary.ambulatory_avg) /
          2;
        return scoreB - scoreA;
      }

      const priceA = buildPlanFinalPriceQuote(
        a.base_price_uf,
        dashboard.beneficiarySummary,
        dashboard.ufToClp,
        a.ges_premium_uf,
      ).finalPriceUf;
      const priceB = buildPlanFinalPriceQuote(
        b.base_price_uf,
        dashboard.beneficiarySummary,
        dashboard.ufToClp,
        b.ges_premium_uf,
      ).finalPriceUf;

      return sortKey === "price_asc" ? priceA - priceB : priceB - priceA;
    });
  }, [plans, sortKey, dashboard.beneficiarySummary, dashboard.ufToClp]);

  useEffect(() => {
    if (!solicitarFlowActive || !deepLink.planCode) return;

    const planInResults = plans.find(
      (plan) => plan.unique_code === deepLink.planCode,
    );

    if (!planInResults) return;

    setContractModalTab(deepLink.modalTab ?? "request");
    setContractPlan(planInResults);
    setRecoveryNotice(null);
  }, [solicitarFlowActive, deepLink.planCode, deepLink.modalTab, plans]);

  useEffect(() => {
    if (!formReady || !solicitarFlowActive || !deepLink.planCode) {
      return;
    }

    const planCode = deepLink.planCode;
    const modalTab = deepLink.modalTab ?? "request";

    if (contractPlan?.unique_code === planCode) {
      return;
    }

    if (solicitarFetchStartedRef.current === planCode) {
      return;
    }

    solicitarFetchStartedRef.current = planCode;
    setContractModalTab(modalTab);

    const controller = new AbortController();
    const fetchTimeout = window.setTimeout(() => controller.abort(), 10_000);

    async function loadPlanForSolicitar() {
      try {
        const response = await fetch(
          `/api/plans/${encodeURIComponent(planCode)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;

        const plan = (await response.json()) as HealthPlan;
        primePlanDetailCache(plan);
        setContractPlan(mapHealthPlanToSummary(plan));
        setRecoveryNotice(null);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        console.error("No se pudo abrir el plan desde deep link:", loadError);
      } finally {
        window.clearTimeout(fetchTimeout);
      }
    }

    void loadPlanForSolicitar();

    return () => {
      controller.abort();
      window.clearTimeout(fetchTimeout);
    };
  }, [formReady, solicitarFlowActive, deepLink.planCode, deepLink.modalTab, contractPlan?.unique_code]);

  useEffect(() => {
    if (
      !formReady ||
      !solicitarFlowActive ||
      !deepLink.hasSolicitarDeepLink ||
      solicitarRecoveryDoneRef.current
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (contractPlan !== null) return;

      solicitarRecoveryDoneRef.current = true;
      setSolicitarFlowActive(false);
      stripSolicitarParamsFromBrowserUrl(deepLink.planCode);
      setSearchText("");
      setRecoveryNotice(SOLICITAR_RECOVERY_NOTICE);

      if (!hasSearched || loading) {
        skipDebouncedSearchRef.current = true;
        void search(
          {
            priceMin: dashboard.priceMin,
            priceMax: dashboard.priceMax,
            filters: dashboard.dashboardFilters,
            limit: INITIAL_PLANS_PAGE_SIZE,
          },
          { force: true },
        );
      }

      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, SOLICITAR_DEEP_LINK_RECOVERY_MS);

    return () => window.clearTimeout(timer);
  }, [
    formReady,
    solicitarFlowActive,
    deepLink.hasSolicitarDeepLink,
    deepLink.planCode,
    contractPlan,
    hasSearched,
    loading,
    search,
    dashboard.priceMin,
    dashboard.priceMax,
    dashboard.dashboardFilters,
  ]);

  const awaitingAutoSearch =
    deepLink.shouldAutoSearch && !hasSearched && !error;
  const showFullLoading =
    (loading || boundsLoading) && awaitingAutoSearch;
  const hasMoreResults = total > plans.length;
  const showInlineLoading = loading && hasSearched && plans.length > 0;

  function handleCalculate() {
    setResultsLimit(INITIAL_PLANS_PAGE_SIZE);
    skipDebouncedSearchRef.current = true;
    void search(
      {
        q: searchText,
        priceMin: dashboard.priceMin,
        priceMax: dashboard.priceMax,
        filters: dashboard.dashboardFilters,
        limit: INITIAL_PLANS_PAGE_SIZE,
      },
      { force: true },
    ).then(() => {
      void sendSearchCotizacionNotify();
    });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLoadMore() {
    const nextLimit = resultsLimit + PLANS_PAGE_SIZE_STEP;
    setResultsLimit(nextLimit);
    skipDebouncedSearchRef.current = true;
    void search(
      {
        q: searchText,
        priceMin: dashboard.priceMin,
        priceMax: dashboard.priceMax,
        filters: dashboard.dashboardFilters,
        limit: nextLimit,
      },
      { force: true },
    );
  }

  const brandKey = isBranded ? entity!.brandKey : undefined;

  return (
    <div
      data-brand={brandKey}
      data-partner={isBranded ? entity!.slug : undefined}
      style={isBranded ? themeStyle : undefined}
      className={joinClasses(appShellRoot, ui.canvas)}
    >
      <PublicCotizadorHeader />

      <main
        className={joinClasses(
          appShellScroll,
          safeWidth,
          "px-3 py-5 sm:px-4 sm:py-6 lg:px-6",
        )}
      >
        <div className={joinClasses(publicCotizadorShell, safeWidth, "space-y-5")}>
          <header
            className={joinClasses(safeWidth, "motion-safe-fade-in space-y-2")}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Cotizador en línea
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">
              Encuentra tu plan de salud
            </h1>
          </header>

          <PublicQuoteCriteriaBar
            criteria={criteria}
            onCriteriaChange={(patch) =>
              setCriteria((current) => ({ ...current, ...patch }))
            }
            beneficiaries={dashboard.beneficiaries}
            onBeneficiariesChange={dashboard.handleBeneficiariesChange}
            onCalculate={handleCalculate}
            showPreloadedDependents={
              deepLink.hasDeepLinkParams &&
              dashboard.beneficiaries.dependents.length > 0
            }
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

            <div
              className={joinClasses(safeWidth, "flex min-h-0 gap-0 lg:gap-5")}
            >
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
                {showFullLoading ? (
                  <PublicPlanResultsLoading />
                ) : !hasSearched && !deepLink.shouldAutoSearch ? (
                  <div
                    className={joinClasses(
                      "rounded-2xl border border-dashed bg-white px-6 py-16 text-center",
                      ui.border,
                    )}
                  >
                    <p className="font-medium text-foreground">
                      Completa tus datos y pulsa «Buscar mejor plan»
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Te mostraremos opciones según tu perfil.
                    </p>
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
                      onClick={() => runSearch(undefined, { force: true })}
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
                      onRequestPlan={(plan) => {
                        setContractModalTab(undefined);
                        setContractPlan(plan);
                      }}
                    />
                    {showInlineLoading ? (
                      <div className="mt-4">
                        <PublicPlanResultsLoadingInline />
                      </div>
                    ) : null}
                    {hasMoreResults && !showInlineLoading ? (
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
                          {Math.min(PLANS_PAGE_SIZE_STEP, total - plans.length)}{" "}
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

      <PublicWhatsAppFab />

      <PublicCotizadorNotice
        message={recoveryNotice}
        onDismiss={() => setRecoveryNotice(null)}
      />

      <ContractPlanModal
        open={contractPlan !== null}
        planSummary={contractPlan}
        beneficiarySummary={dashboard.beneficiarySummary}
        dependents={dashboard.beneficiaries.dependents}
        ufToClp={dashboard.ufToClp}
        criteria={criteria}
        filters={dashboard.dashboardFilters}
        searchText={searchText}
        sortKey={sortKey}
        currency={currency}
        deepLink={deepLink}
        initialTab={contractModalTab}
        onClose={() => {
          setContractPlan(null);
          setContractModalTab(undefined);
        }}
      />
    </div>
  );
}
