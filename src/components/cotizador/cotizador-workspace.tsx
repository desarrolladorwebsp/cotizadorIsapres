"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FiltersFab, FiltersSidebar } from "@/components/filters";
import {
  CompanyAgreementProvider,
  CompanyAgreementValidationSection,
  useOptionalCompanyAgreementContext,
} from "@/components/cotizador/company-agreement";
import { RegionFilterSelect } from "@/components/filters/region-filter-select";
import { PlanResultsList } from "@/components/plan-card";
import { CotizadorHeader, type CotizadorHeaderVariant } from "@/components/cotizador/cotizador-header";
import { CotizadorNav } from "@/components/cotizador/cotizador-nav";
import { AssignPlanToClientModal } from "@/components/executive/assign-plan-to-client-modal";
import { PlanCompareModal } from "@/components/executive/plan-compare-modal";
import { IconWhatsApp } from "@/components/executive/executive-icons";
import { useCotizadorDashboard } from "@/hooks/use-cotizador-dashboard";
import { usePlansCatalog } from "@/hooks/use-plans-catalog";
import {
  fetchExecutiveClients,
  sendExecutiveSelectedPlansEmail,
} from "@/lib/api/admin-client";
import {
  applyRegionToDashboardFilters,
  createDefaultDashboardFilters,
  getActiveAmbulatoryClinicIds,
  getActiveHospitalClinicIds,
} from "@/domain";
import {
  buildSelectedPlansEmailSnapshots,
  buildSelectedPlansShareMessage,
  buildSelectedPlansTableTsv,
  copyTextToClipboard,
} from "@/lib/executive/build-plan-whatsapp-message";
import { buildWhatsAppUrl } from "@/lib/partner-entity/theme";
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
import type { BeneficiaryGroupSummary, HealthPlan } from "@/domain";
import type { UserRecord } from "@/types/user";
import {
  appShell,
  appShellRoot,
  appShellScroll,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

const CLIENT_REQUIRED_MESSAGE =
  "Selecciona un cliente antes de compartir los planes.";

function isValidClientEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildBeneficiaryProfileSummary(
  summary: BeneficiaryGroupSummary,
): string {
  const factor = summary.totalFactors.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const cargas =
    summary.dependents.length > 0
      ? `Cargas: ${summary.dependents.map((d) => d.age ?? "—").join(", ")}`
      : "Sin cargas";
  return `Cotizante: ${summary.contributor.age ?? "—"} años · ${cargas} · Factor total: ${factor}`;
}

function sortPlansByKey(
  source: HealthPlan[],
  sortKey: QuoteSortKey,
  beneficiarySummary: BeneficiaryGroupSummary,
  ufToClp: number,
): HealthPlan[] {
  const next = [...source];

  if (sortKey === "price_desc") {
    return next.sort(
      (a, b) =>
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

    return next.sort((a, b) => {
      const diff = coverageScore(b) - coverageScore(a);
      if (diff !== 0) return diff;
      return comparePlansByFinalPriceAsc(a, b, beneficiarySummary, ufToClp);
    });
  }

  return next;
}

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
  const [clients, setClients] = useState<UserRecord[]>([]);
  const [activeClientId, setActiveClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clientPickerOpen, setClientPickerOpen] = useState(false);
  const [selectedPlanCodes, setSelectedPlanCodes] = useState<Set<string>>(
    () => new Set(),
  );
  const [showSelectedPlansOnly, setShowSelectedPlansOnly] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [selectionBarHeight, setSelectionBarHeight] = useState(0);
  /** Acciones de la barra ocultas por defecto (mobile y desktop). */
  const [selectionActionsOpen, setSelectionActionsOpen] = useState(false);
  const isExecutive = variant === "executive";
  const searchParams = useSearchParams();
  const clientPickerRef = useRef<HTMLDivElement>(null);
  const selectionBarRef = useRef<HTMLDivElement>(null);
  const validatedAgreement =
    useOptionalCompanyAgreementContext()?.validatedAgreement ?? null;
  const selectedPlanCount = isExecutive ? selectedPlanCodes.size : 0;
  const showSelectionBar = selectedPlanCount > 0;
  const isSelectedPlansView = isExecutive && showSelectedPlansOnly;

  const handlePlanSelectedChange = useCallback(
    (uniqueCode: string, selected: boolean) => {
      if (!isExecutive) return;

      setSelectedPlanCodes((current) => {
        const next = new Set(current);
        if (selected) next.add(uniqueCode);
        else next.delete(uniqueCode);
        return next;
      });

      if (!selected) {
        const remaining = selectedPlanCodes.has(uniqueCode)
          ? selectedPlanCodes.size - 1
          : selectedPlanCodes.size;
        if (remaining === 0) {
          setShowSelectedPlansOnly(false);
          setSelectionActionsOpen(false);
        }
        if (remaining < 2) {
          setCompareOpen(false);
        }
      }
    },
    [isExecutive, selectedPlanCodes],
  );

  const clearPlanSelection = useCallback(() => {
    setSelectedPlanCodes(new Set());
    setShowSelectedPlansOnly(false);
    setCompareOpen(false);
    setSelectionActionsOpen(false);
  }, []);

  useEffect(() => {
    if (!showSelectionBar) return;

    const node = selectionBarRef.current;
    if (!node) return;

    const updateHeight = () => {
      const next = Math.ceil(node.getBoundingClientRect().height);
      setSelectionBarHeight((current) => (current === next ? current : next));
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [
    showSelectionBar,
    showSelectedPlansOnly,
    emailSending,
    selectedPlanCount,
    selectionActionsOpen,
  ]);

  useEffect(() => {
    if (!isExecutive) return;

    let cancelled = false;
    void fetchExecutiveClients()
      .then((rows) => {
        if (!cancelled) setClients(rows);
      })
      .catch(() => {
        if (!cancelled) {
          onNotify?.(
            "No se pudieron cargar los clientes para WhatsApp.",
            "error",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isExecutive, onNotify]);

  useEffect(() => {
    if (!isExecutive) return;
    const fromUrl = searchParams.get("clientId")?.trim();
    if (fromUrl) setActiveClientId(fromUrl);
  }, [isExecutive, searchParams]);

  useEffect(() => {
    if (!clientPickerOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        clientPickerRef.current &&
        !clientPickerRef.current.contains(target)
      ) {
        setClientPickerOpen(false);
        setClientSearch("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [clientPickerOpen]);

  const activeClientRecord = useMemo(() => {
    if (!activeClientId) return null;
    return clients.find((client) => client.id === activeClientId) ?? null;
  }, [activeClientId, clients]);

  const activeClient = useMemo(() => {
    if (!activeClientRecord) return null;
    return {
      fullName: activeClientRecord.fullName,
      phone: activeClientRecord.phone,
    };
  }, [activeClientRecord]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [client.fullName, client.email, client.phone, client.rut]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clients, clientSearch]);

  function selectActiveClient(clientId: string) {
    setActiveClientId(clientId);
    setClientPickerOpen(false);
    setClientSearch("");
  }

  function clearActiveClient() {
    setActiveClientId("");
    setClientPickerOpen(false);
    setClientSearch("");
  }

  const displayedPlans = useMemo(
    () =>
      sortPlansByKey(filteredPlans, sortKey, beneficiarySummary, ufToClp),
    [filteredPlans, sortKey, beneficiarySummary, ufToClp],
  );

  const selectedPlans = useMemo(() => {
    if (!isExecutive || selectedPlanCodes.size === 0) return [];
    const selected = plans.filter((plan) =>
      selectedPlanCodes.has(plan.unique_code),
    );
    return sortPlansByKey(selected, sortKey, beneficiarySummary, ufToClp);
  }, [
    isExecutive,
    plans,
    selectedPlanCodes,
    sortKey,
    beneficiarySummary,
    ufToClp,
  ]);

  const visiblePlans = useMemo(
    () => displayedPlans.slice(0, visibleCount),
    [displayedPlans, visibleCount],
  );

  const plansToDisplay = isSelectedPlansView ? selectedPlans : visiblePlans;

  const hasMorePlans =
    !isSelectedPlansView && displayedPlans.length > visiblePlans.length;

  const shouldShowPlanList = isSelectedPlansView
    ? selectedPlans.length > 0
    : displayedPlans.length > 0;

  const selectedShareInput = useMemo(
    () => ({
      plans: selectedPlans,
      beneficiarySummary,
      ufToClp,
      highlightHospitalClinicIds: getActiveHospitalClinicIds(dashboardFilters),
      highlightAmbulatoryClinicIds:
        getActiveAmbulatoryClinicIds(dashboardFilters),
      clientFullName: activeClientRecord?.fullName ?? null,
      validatedAgreement,
    }),
    [
      selectedPlans,
      beneficiarySummary,
      ufToClp,
      dashboardFilters,
      activeClientRecord?.fullName,
      validatedAgreement,
    ],
  );

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

  function requireActiveClient(): UserRecord | null {
    if (!activeClientRecord) {
      notify(CLIENT_REQUIRED_MESSAGE, "error");
      return null;
    }
    return activeClientRecord;
  }

  async function handleCopySelectedTable() {
    if (!requireActiveClient()) return;
    if (selectedPlans.length === 0) return;

    const tsv = buildSelectedPlansTableTsv(selectedShareInput);
    const copied = await copyTextToClipboard(tsv);
    if (copied) {
      notify(
        `Tabla de ${selectedPlans.length} planes copiada correctamente.`,
      );
      return;
    }
    notify(
      "No se pudo copiar la tabla. Revisa los permisos del portapapeles.",
      "error",
    );
  }

  function handleWhatsAppSelectedPlans() {
    const client = requireActiveClient();
    if (!client) return;
    if (selectedPlans.length === 0) return;

    const phone = client.phone?.trim() || null;
    if (!phone) {
      notify(
        "El cliente seleccionado no tiene un teléfono registrado.",
        "error",
      );
      return;
    }

    const message = buildSelectedPlansShareMessage(selectedShareInput);
    window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
    notify(
      `Abriendo WhatsApp con ${selectedPlans.length} planes seleccionados.`,
    );
  }

  async function handleEmailSelectedPlans() {
    const client = requireActiveClient();
    if (!client || emailSending) return;
    if (selectedPlans.length === 0) return;

    if (!isValidClientEmail(client.email)) {
      notify("El cliente seleccionado no tiene un correo válido.", "error");
      return;
    }

    setEmailSending(true);
    try {
      const result = await sendExecutiveSelectedPlansEmail({
        clientId: client.id,
        profileSummary: buildBeneficiaryProfileSummary(beneficiarySummary),
        plans: buildSelectedPlansEmailSnapshots(selectedShareInput),
      });
      notify(
        `Correo enviado a ${result.email} con ${result.planCount} planes seleccionados.`,
      );
    } catch (error) {
      notify(
        error instanceof Error && error.message.trim()
          ? error.message
          : "No se pudo enviar el correo. Intenta nuevamente.",
        "error",
      );
    } finally {
      setEmailSending(false);
    }
  }

  function handleCompareSelectedPlans() {
    if (selectedPlans.length < 2) {
      notify("Selecciona al menos 2 planes para comparar.", "error");
      return;
    }
    setCompareOpen(true);
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

  const selectionBarFallbackHeight = selectionActionsOpen ? "12.5rem" : "4.75rem";

  const selectionBarCssVars = (
    showSelectionBar
      ? {
          "--selection-bar-height":
            selectionBarHeight > 0
              ? `${Math.ceil(selectionBarHeight)}px`
              : selectionBarFallbackHeight,
        }
      : undefined
  ) as CSSProperties | undefined;

  const filtersFabBottomOffset =
    isExecutive && showSelectionBar
      ? `var(--selection-bar-height, ${selectionBarFallbackHeight})`
      : undefined;

  return (
    <div
      data-executive-cotizador={embeddedInExecutiveShell ? "true" : undefined}
      style={selectionBarCssVars}
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
                {isExecutive ? (
                  <div
                    ref={clientPickerRef}
                    className="relative min-w-0 flex-1 sm:max-w-xs sm:flex-none"
                  >
                    <label
                      htmlFor="active-client-search"
                      className="mb-1 block text-xs font-medium text-muted"
                    >
                      Cliente activo
                    </label>
                    <div className="relative">
                      <input
                        id="active-client-search"
                        type="search"
                        autoComplete="off"
                        value={
                          clientPickerOpen
                            ? clientSearch
                            : (activeClientRecord?.fullName ?? "")
                        }
                        placeholder="Buscar cliente…"
                        onFocus={() => {
                          setClientPickerOpen(true);
                          setClientSearch("");
                        }}
                        onChange={(event) => {
                          setClientPickerOpen(true);
                          setClientSearch(event.target.value);
                        }}
                        className={joinClasses(
                          "h-10 w-full rounded-lg py-2 pl-3 pr-16 text-sm",
                          ui.input,
                        )}
                        aria-expanded={clientPickerOpen}
                        aria-controls="active-client-results"
                        aria-autocomplete="list"
                      />
                      {activeClientId ? (
                        <button
                          type="button"
                          onClick={clearActiveClient}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[11px] font-semibold text-muted hover:bg-surface-hover hover:text-foreground"
                        >
                          Quitar
                        </button>
                      ) : null}
                    </div>

                    {clientPickerOpen ? (
                      <div
                        id="active-client-results"
                        role="listbox"
                        className={joinClasses(
                          "absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border bg-white p-1.5 shadow-lg",
                          ui.border,
                        )}
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={!activeClientId}
                          onClick={clearActiveClient}
                          className={joinClasses(
                            "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                            !activeClientId
                              ? "bg-primary/10 font-semibold text-primary-dark"
                              : "text-muted hover:bg-surface-hover",
                          )}
                        >
                          Sin cliente (copiar mensaje)
                        </button>
                        {filteredClients.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-muted">
                            Sin coincidencias
                          </p>
                        ) : (
                          filteredClients.map((client) => {
                            const selected = client.id === activeClientId;
                            return (
                              <button
                                key={client.id}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => selectActiveClient(client.id)}
                                className={joinClasses(
                                  "w-full rounded-lg px-3 py-2 text-left transition",
                                  selected
                                    ? "bg-primary/10 ring-1 ring-primary/25"
                                    : "hover:bg-surface-hover",
                                )}
                              >
                                <span className="block text-sm font-medium text-foreground">
                                  {client.fullName}
                                </span>
                                <span className="mt-0.5 block text-[11px] text-muted">
                                  {[client.email, client.phone]
                                    .filter(Boolean)
                                    .join(" · ") || "Sin contacto"}
                                  {!client.phone ? " · sin teléfono" : ""}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}

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
            ) : shouldShowPlanList ? (
              <div
                className={joinClasses(
                  "flex flex-col gap-6 sm:gap-8 xl:gap-10",
                  showSelectionBar &&
                    "pb-[calc(var(--selection-bar-height,4.75rem)+5.5rem)] sm:pb-[calc(var(--selection-bar-height,4.75rem)+3rem)] lg:pb-[calc(var(--selection-bar-height,4.75rem)+1.5rem)]",
                )}
              >
                <PlanResultsList
                  plans={plansToDisplay}
                  beneficiarySummary={beneficiarySummary}
                  ufToClp={ufToClp}
                  highlightHospitalClinicIds={getActiveHospitalClinicIds(
                    dashboardFilters,
                  )}
                  highlightAmbulatoryClinicIds={getActiveAmbulatoryClinicIds(
                    dashboardFilters,
                  )}
                  activeClient={isExecutive ? activeClient : null}
                  onNotify={isExecutive ? notify : undefined}
                  onAssignPlan={
                    isExecutive ? (plan) => setAssignPlan(plan) : undefined
                  }
                  selectedPlanCodes={
                    isExecutive ? selectedPlanCodes : undefined
                  }
                  onPlanSelectedChange={
                    isExecutive ? handlePlanSelectedChange : undefined
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
              </div>
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
          bottomOffset={filtersFabBottomOffset}
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
          initialClientId={activeClientId || null}
        />
      ) : null}

      {isExecutive ? (
        <PlanCompareModal
          open={compareOpen}
          plans={selectedPlans}
          beneficiarySummary={beneficiarySummary}
          ufToClp={ufToClp}
          onClose={() => setCompareOpen(false)}
        />
      ) : null}
      </div>

      {isExecutive && showSelectionBar ? (
        <div
          ref={selectionBarRef}
          role="region"
          aria-label="Planes seleccionados"
          className={joinClasses(
            "fixed inset-x-0 bottom-0 z-30 border-t border-primary/20 bg-gradient-to-r from-primary/10 via-white/95 to-secondary-muted/80 shadow-[0_-10px_32px_-10px_rgba(9,37,88,0.22)] backdrop-blur-md",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div
            className={joinClasses(
              appShell,
              safeWidth,
              "flex flex-col gap-2.5 px-3 py-3 sm:gap-3 sm:px-6 sm:py-3.5",
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <span
                aria-hidden
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold tabular-nums text-primary-foreground shadow-[0_4px_12px_-3px_var(--primary)] sm:size-10"
              >
                {selectedPlanCount}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-primary-dark">
                  {selectedPlanCount === 1
                    ? "1 plan seleccionado"
                    : `${selectedPlanCount} planes seleccionados`}
                </p>
                <p className="truncate text-xs text-muted">
                  {selectionActionsOpen
                    ? showSelectedPlansOnly
                      ? "Viendo solo la selección"
                      : "Elige una acción"
                    : "Toca Acciones para Limpiar, Email, WhatsApp…"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectionActionsOpen((current) => !current)
                }
                aria-expanded={selectionActionsOpen}
                aria-controls="selection-actions-panel"
                className={joinClasses(
                  touchTarget,
                  "h-auto min-h-11 shrink-0 gap-1.5 rounded-xl border px-3 text-xs font-bold transition active:scale-[0.98] sm:min-h-10 sm:text-sm",
                  selectionActionsOpen
                    ? joinClasses(
                        ui.border,
                        "bg-white text-primary-dark hover:bg-surface-hover",
                      )
                    : "border-primary/40 bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_var(--primary)] hover:bg-primary-hover",
                )}
              >
                <span>{selectionActionsOpen ? "Ocultar" : "Acciones"}</span>
                <svg
                  viewBox="0 0 20 20"
                  className={joinClasses(
                    "size-3.5 shrink-0 transition-transform",
                    selectionActionsOpen && "rotate-180",
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path
                    d="M5 8l5 5 5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {selectionActionsOpen ? (
                <motion.div
                  id="selection-actions-panel"
                  key="selection-actions"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  {/* Limpiar vive solo en el panel expandido para no saturar la fila compacta. */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center">
                    <button
                      type="button"
                      onClick={clearPlanSelection}
                      aria-label="Limpiar selección"
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border border-danger/25 bg-danger-muted px-2.5 text-xs font-semibold text-danger transition hover:border-danger/45 hover:bg-danger-muted/80 active:scale-[0.98] sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                      )}
                    >
                      Limpiar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowSelectedPlansOnly((current) => !current)
                      }
                      aria-pressed={showSelectedPlansOnly}
                      aria-label={
                        showSelectedPlansOnly
                          ? "Mostrar todos los planes"
                          : "Mostrar solo planes seleccionados"
                      }
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition active:scale-[0.98] sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                        showSelectedPlansOnly
                          ? "border-secondary/60 bg-secondary text-primary-dark shadow-[0_4px_14px_-4px_var(--secondary)] hover:brightness-105"
                          : "border-primary/40 bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_var(--primary)] hover:bg-primary-hover",
                      )}
                    >
                      <span className="lg:hidden">
                        {showSelectedPlansOnly ? "Todos" : "Seleccionados"}
                      </span>
                      <span className="hidden lg:inline">
                        {showSelectedPlansOnly
                          ? "Mostrar todos"
                          : "Mostrar seleccionados"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleEmailSelectedPlans()}
                      disabled={emailSending}
                      aria-label={
                        emailSending
                          ? "Enviando correo"
                          : "Enviar por email los planes seleccionados"
                      }
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-50 px-2.5 text-xs font-bold text-teal-800 transition hover:border-teal-500 hover:bg-teal-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                      )}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <path
                          d="M3 5.5h14v9H3v-9Zm0 0 7 5.5 7-5.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="lg:hidden">
                        {emailSending ? "Enviando…" : "Email"}
                      </span>
                      <span className="hidden lg:inline">
                        {emailSending ? "Enviando…" : "Enviar por email"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCopySelectedTable()}
                      aria-label="Copiar tabla de planes seleccionados"
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border border-violet-400/50 bg-violet-50 px-2.5 text-xs font-bold text-violet-800 transition hover:border-violet-500 hover:bg-violet-100 active:scale-[0.98] sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                      )}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <path
                          d="M7 4.5h8.5V13H7V4.5ZM4.5 7H6v8.5h8V17H4.5V7Z"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="lg:hidden">Copiar</span>
                      <span className="hidden lg:inline">Copiar tabla</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppSelectedPlans}
                      aria-label="Enviar por WhatsApp los planes seleccionados"
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border border-[#25D366]/55 bg-[#25D366]/15 px-2.5 text-xs font-bold text-[#128C7E] transition hover:border-[#25D366] hover:bg-[#25D366]/25 active:scale-[0.98] sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                      )}
                    >
                      <IconWhatsApp className="size-3.5 shrink-0" />
                      WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={handleCompareSelectedPlans}
                      aria-label="Comparar planes seleccionados"
                      className={joinClasses(
                        touchTarget,
                        "h-auto min-h-11 w-full justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary px-2.5 text-xs font-bold text-primary-foreground shadow-[0_4px_14px_-4px_var(--primary)] transition hover:bg-primary-hover active:scale-[0.98] sm:min-h-10 sm:text-sm lg:w-auto lg:px-3",
                      )}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="size-3.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden
                      >
                        <path
                          d="M4 14V6m4 8V8m4 6V5m4 9v-4"
                          strokeLinecap="round"
                        />
                      </svg>
                      Comparar
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </div>
  );
}
