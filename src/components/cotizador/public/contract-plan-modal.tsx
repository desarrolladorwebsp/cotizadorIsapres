"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IsapreLogo } from "@/components/plan-card/isapre-logo";
import {
  buildPlanFinalPriceQuote,
  formatPlanClp,
  formatQuotedUf,
  PLAN_TYPE_LABELS,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
} from "@/domain";
import { SINGLE_PERSON_AGE_SAMPLES } from "@/lib/plan-price-by-age";
import {
  accent,
  accentIconClass,
  horizontalScrollRail,
  planTypeBadgeTone,
  safeWidth,
  statusBadgeToneClass,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { usePlanDetail } from "@/hooks/use-plan-detail";
import type { BeneficiaryGroupSummary, FamilyBeneficiariesState } from "@/domain";
import type { HealthPlanSummary } from "@/domain";
import type { QuoteCriteria } from "./public-quote-criteria-bar";
import { notifyCotizacionByEmail } from "@/lib/cotizacion-notify/client";
import type { ParsedCotizadorDeepLink } from "@/lib/deep-link/parse-cotizador-url";
import type { QuoteSortKey } from "@/lib/quote-criteria-options";
import type { CurrencyDisplay } from "./public-results-toolbar";
import type { DashboardFiltersState } from "@/types/filters";
import { ModalPlanOverviewPanel } from "./modal-plan-overview-panel";
import { ModalPricePanel } from "./modal-price-panel";
import {
  isValidRequestEmail,
  ModalRequestForm,
  normalizeRequestPhoneDigits,
} from "./modal-request-form";

export interface ContractPlanModalProps {
  open: boolean;
  planSummary: HealthPlanSummary | null;
  beneficiarySummary: BeneficiaryGroupSummary;
  dependents: FamilyBeneficiariesState["dependents"];
  ufToClp: number;
  criteria: QuoteCriteria;
  filters: DashboardFiltersState;
  searchText: string;
  sortKey: QuoteSortKey;
  currency: CurrencyDisplay;
  deepLink: ParsedCotizadorDeepLink;
  onClose: () => void;
}

type ModalTabId = "overview" | "price" | "request";

const MODAL_TABS: {
  id: ModalTabId;
  label: string;
  icon: string;
  tone: "primary" | "secondary" | "warning";
}[] = [
  { id: "overview", label: "Vista general", icon: "◎", tone: "secondary" },
  { id: "price", label: "Precio", icon: "$", tone: "primary" },
  { id: "request", label: "Solicitar", icon: "✉", tone: "primary" },
];

const BENEFITS = [
  {
    title: "Sin costo adicional",
    description: "La asesoría y cotización no tienen cargo para ti.",
    icon: "✓",
    tone: "primary" as const,
  },
  {
    title: "Acompañamiento post-venta",
    description: "Te guiamos hasta la incorporación y después del contrato.",
    icon: "★",
    tone: "secondary" as const,
  },
  {
    title: "Cancelación gratuita",
    description: "Puedes desistir sin compromiso antes de firmar.",
    icon: "↺",
    tone: "warning" as const,
  },
] as const;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function resolveChartHighlightAge(age: number | null): number | null {
  if (age === null) return null;
  return SINGLE_PERSON_AGE_SAMPLES.reduce((closest, sample) =>
    Math.abs(sample - age) < Math.abs(closest - age) ? sample : closest,
  );
}

export function ContractPlanModal({
  open,
  planSummary,
  beneficiarySummary,
  dependents,
  ufToClp,
  criteria,
  filters,
  searchText,
  sortKey,
  currency,
  deepLink,
  onClose,
}: ContractPlanModalProps) {
  const { plan: detailPlan, loading: detailLoading } = usePlanDetail(
    planSummary?.unique_code ?? null,
    open,
  );
  const [activeTab, setActiveTab] = useState<ModalTabId>("overview");
  const [submitted, setSubmitted] = useState(false);
  const [emailNotifyFailed, setEmailNotifyFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isCurrentIsapre, setIsCurrentIsapre] = useState<"yes" | "no" | "">("");

  useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setSubmitted(false);
      setEmailNotifyFailed(false);
      setSubmitting(false);
      setSubmitError(null);
      setValidationErrors([]);
      setAttemptedSubmit(false);
      setName("");
      setRut("");
      setEmail("");
      setPhone("");
      setIsCurrentIsapre("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [open, onClose]);

  const priceQuote = useMemo(() => {
    if (!planSummary) return null;
    return buildPlanFinalPriceQuote(
      planSummary.base_price_uf,
      beneficiarySummary,
      ufToClp,
    );
  }, [planSummary, beneficiarySummary, ufToClp]);

  const chartHighlightAge = useMemo(
    () => resolveChartHighlightAge(beneficiarySummary.contributor.age),
    [beneficiarySummary.contributor.age],
  );

  if (!planSummary || !priceQuote) return null;

  const summary = planSummary;
  const quote = priceQuote;

  const planType = resolvePrimaryPlanType(summary);
  const planTypeLabel = PLAN_TYPE_LABELS[planType];
  const badgeTone = statusBadgeToneClass[planTypeBadgeTone[planType]];
  const commercialName = resolveCommercialPlanName(summary);

  function collectValidationErrors(): string[] {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Ingresa tu nombre y apellido.");
    }
    if (!rut.trim()) {
      errors.push("Ingresa tu RUT.");
    } else if (rut.replace(/\D/g, "").length < 7) {
      errors.push("El RUT ingresado no parece válido.");
    }
    if (!email.trim()) {
      errors.push("Ingresa tu correo electrónico.");
    } else if (!isValidRequestEmail(email)) {
      errors.push("Ingresa un correo electrónico válido.");
    }
    if (!phone.trim()) {
      errors.push("Ingresa tu teléfono de contacto.");
    } else if (normalizeRequestPhoneDigits(phone).length < 8) {
      errors.push("Ingresa un teléfono válido (mínimo 8 dígitos).");
    }
    if (isCurrentIsapre === "") {
      errors.push(`Indica si ${summary.isapre} es tu Isapre actual.`);
    }

    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setAttemptedSubmit(true);
    setSubmitError(null);

    const errors = collectValidationErrors();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSubmitting(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: summary.unique_code,
          fullName: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          rut: rut.trim(),
          region: criteria.region || null,
          sex: criteria.sex || null,
          monthlyIncome: criteria.monthlyIncome || null,
          contributorAge: beneficiarySummary.contributor.age,
          dependentsCount: beneficiarySummary.dependents.length,
          dependentAges: beneficiarySummary.dependents
            .map((dependent) => dependent.age)
            .filter((age): age is number => age !== null),
          finalPriceUf: quote.finalPriceUf,
          finalPriceClp: quote.finalPriceClp,
          ufValue: ufToClp,
          beneficiaryCount: beneficiarySummary.beneficiaryCount,
          totalFactors: beneficiarySummary.totalFactors,
          quoteReason: "Solicitud desde cotizador público",
          notes:
            isCurrentIsapre === "yes"
              ? `Ya es afiliado a ${summary.isapre}`
              : `No es afiliado actualmente a ${summary.isapre}`,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "No se pudo enviar la solicitud.");
      }

      try {
        await notifyCotizacionByEmail({
          email: email.trim(),
          criteria,
          beneficiarySummary,
          filters,
          searchText,
          sortKey,
          currency,
          deepLink,
          plan: summary,
          priceQuote: quote,
        });
        setEmailNotifyFailed(false);
      } catch (notifyError) {
        setEmailNotifyFailed(true);
        console.error(
          "La solicitud se guardó, pero falló el envío de correos:",
          notifyError,
        );
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la solicitud. Intenta nuevamente o contáctanos.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-primary-dark/55 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contract-plan-title"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className={joinClasses(
              safeWidth,
              "relative z-10 flex max-h-[96dvh] w-full max-w-full flex-col overflow-hidden overscroll-none rounded-t-2xl border bg-white shadow-2xl sm:max-h-[92dvh] sm:max-w-6xl sm:rounded-2xl",
              ui.border,
            )}
          >
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary/70 to-accent-warning/80"
              aria-hidden
            />

            <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 pt-4 sm:px-6">
              <div className="flex items-center gap-3">
                <IsapreLogo isapre={summary.isapre} size="md" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {summary.isapre}
                  </p>
                  <p className="text-sm font-bold text-primary-dark">
                    Isapres Premium
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className={joinClasses(
                  "rounded-full p-2 text-muted transition hover:bg-surface-hover hover:text-foreground",
                  touchTarget,
                )}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-secondary-muted px-4 py-2.5 text-center text-sm text-primary-dark sm:px-6">
              <span
                className={joinClasses(
                  "hidden size-6 shrink-0 items-center justify-center rounded-full sm:inline-flex",
                  accentIconClass.secondary,
                )}
                aria-hidden
              >
                ✉
              </span>
              {activeTab === "request"
                ? "Completa el formulario para recibir un precio exacto con un ejecutivo especializado."
                : activeTab === "price"
                  ? "Revisa el precio estimado del plan según la edad del cotizante."
                  : "Conoce las coberturas y características principales del plan."}
            </div>

            <div className="grid shrink-0 gap-4 border-b px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={joinClasses(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                      badgeTone,
                    )}
                  >
                    {planTypeLabel}
                  </span>
                </div>
                <h2
                  id="contract-plan-title"
                  className="text-base font-bold leading-snug text-foreground sm:text-lg"
                >
                  {commercialName}
                </h2>
                <p className="font-mono text-xs text-muted">{summary.unique_code}</p>
              </div>

              <div
                className={joinClasses(
                  "rounded-xl border bg-primary/5 px-4 py-3 text-right sm:min-w-52",
                  accent.borderPrimary,
                  accent.ringPrimary,
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                  Precio estimado
                </p>
                <p
                  className={joinClasses(
                    "mt-1 text-xl font-bold sm:text-2xl",
                    accent.valuePrimary,
                  )}
                >
                  Desde {formatPlanClp(priceQuote.finalPriceClp)}
                  <span className="text-sm font-semibold text-muted"> /mes</span>
                </p>
                <p
                  className={joinClasses(
                    "mt-0.5 text-xs font-semibold",
                    accent.valueSecondary,
                  )}
                >
                  {formatQuotedUf(priceQuote.finalPriceUf)}
                </p>
              </div>
            </div>

            <div
              className={joinClasses(
                horizontalScrollRail,
                "flex shrink-0 gap-1 border-b px-4 py-2 sm:px-6",
              )}
              role="tablist"
              aria-label="Secciones del plan"
            >
              {MODAL_TABS.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.id)}
                    className={joinClasses(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
                      active
                        ? "bg-primary/10 text-primary-dark ring-1 ring-primary/20"
                        : "text-muted hover:bg-surface-hover/80",
                    )}
                  >
                    <span
                      className={joinClasses(
                        "flex size-5 items-center justify-center rounded-md text-[10px]",
                        active
                          ? accentIconClass[tab.tone]
                          : "bg-surface-hover text-muted",
                      )}
                      aria-hidden
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-y-contain">
              {submitted ? (
                <div className="space-y-4 px-6 py-12 text-center">
                  <div
                    className={joinClasses(
                      "mx-auto flex size-16 items-center justify-center rounded-full text-2xl",
                      accentIconClass.primary,
                    )}
                  >
                    ✓
                  </div>
                  <p className="text-xl font-bold text-primary-dark">
                    Solicitud enviada correctamente
                  </p>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
                    Tu información fue cargada correctamente. Un ejecutivo
                    especializado de Isapres Premium se pondrá en contacto contigo
                    próximamente para entregarte el precio final y acompañarte en
                    tu incorporación a {summary.isapre}.
                  </p>
                  {emailNotifyFailed ? (
                    <p
                      className="mx-auto mt-4 max-w-md rounded-lg border border-accent-warning/40 bg-warning-muted px-4 py-3 text-sm text-accent-warning-foreground"
                      role="alert"
                    >
                      Tu solicitud quedó registrada, pero no pudimos enviar el
                      correo de confirmación en este momento. Revisa tu bandeja más
                      tarde o contáctanos si no recibes respuesta.
                    </p>
                  ) : (
                    <p className="mx-auto mt-3 max-w-md text-sm font-medium text-primary">
                      Te enviamos un correo de confirmación a {email.trim()}.
                      Si no lo ves en unos minutos, revisa tu carpeta de spam o
                      correo no deseado.
                    </p>
                  )}
                  <Button type="button" onClick={onClose} className="mt-2">
                    Cerrar
                  </Button>
                </div>
              ) : activeTab === "overview" ? (
                detailLoading || !detailPlan ? (
                  <p className="px-6 py-12 text-center text-sm text-muted">
                    Cargando coberturas del plan…
                  </p>
                ) : (
                <ModalPlanOverviewPanel
                  plan={detailPlan}
                  planIsapre={summary.isapre}
                  name={name}
                  onNameChange={setName}
                  rut={rut}
                  onRutChange={setRut}
                  email={email}
                  onEmailChange={setEmail}
                  phone={phone}
                  onPhoneChange={setPhone}
                  isCurrentIsapre={isCurrentIsapre}
                  onIsCurrentIsapreChange={setIsCurrentIsapre}
                  attemptedSubmit={attemptedSubmit}
                  validationErrors={validationErrors}
                  submitError={submitError}
                  submitting={submitting}
                  onSubmit={handleSubmit}
                />
                )
              ) : activeTab === "price" ? (
                <ModalPricePanel
                  basePriceUf={summary.base_price_uf}
                  ufToClp={ufToClp}
                  priceQuote={priceQuote}
                  highlightAge={chartHighlightAge}
                  beneficiarySummary={beneficiarySummary}
                  dependents={dependents}
                />
              ) : (
                <div className="grid gap-0 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
                  <aside className="space-y-4 border-b bg-bg-layout/40 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                    <div
                      className={joinClasses(
                        "rounded-xl border border-primary/15 bg-primary/5 p-4",
                        accent.ringPrimary,
                      )}
                    >
                      <h3 className="text-sm font-bold text-primary-dark">
                        ¿Por qué Isapres Premium?
                      </h3>
                      <ul className="mt-3 space-y-3">
                        {BENEFITS.map((benefit) => (
                          <li key={benefit.title} className="flex gap-3">
                            <span
                              className={joinClasses(
                                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                accentIconClass[benefit.tone],
                              )}
                            >
                              {benefit.icon}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {benefit.title}
                              </p>
                              <p className="text-xs leading-relaxed text-muted">
                                {benefit.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      className={joinClasses(
                        "rounded-xl border bg-white p-4",
                        accent.borderSecondary,
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                        Tu selección
                      </p>
                      <p className="mt-2 text-sm font-bold text-primary-dark">
                        {commercialName}
                      </p>
                      <p className="mt-2 text-lg font-bold text-foreground">
                        {formatPlanClp(priceQuote.finalPriceClp)}
                        <span className="text-xs font-medium text-muted">
                          {" "}
                          /mes
                        </span>
                      </p>
                      <p
                        className={joinClasses(
                          "mt-1 text-xs font-semibold",
                          accent.valueSecondary,
                        )}
                      >
                        {formatQuotedUf(priceQuote.finalPriceUf)}
                      </p>
                    </div>
                  </aside>

                  <div className="p-4 sm:p-6">
                    <ModalRequestForm
                      planIsapre={summary.isapre}
                      name={name}
                      onNameChange={setName}
                      rut={rut}
                      onRutChange={setRut}
                      email={email}
                      onEmailChange={setEmail}
                      phone={phone}
                      onPhoneChange={setPhone}
                      isCurrentIsapre={isCurrentIsapre}
                      onIsCurrentIsapreChange={setIsCurrentIsapre}
                      attemptedSubmit={attemptedSubmit}
                      validationErrors={validationErrors}
                      submitError={submitError}
                      submitting={submitting}
                      onSubmit={handleSubmit}
                      variant="plain"
                      radioGroupName="request-current-isapre"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
