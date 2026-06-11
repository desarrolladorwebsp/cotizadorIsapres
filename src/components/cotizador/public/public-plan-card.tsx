"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GpuExpandPanel } from "@/components/ui/gpu-expand-panel";
import {
  buildPlanFinalPriceQuote,
  formatCoveragePercentagesList,
  formatPlanClp,
  formatQuotedUf,
  PLAN_TYPE_LABELS,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
  splitCoverageByType,
} from "@/domain";
import {
  accent,
  planTypeBadgeTone,
  statusBadgeToneClass,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";
import { DownloadIcon } from "@/components/plan-card/icons";
import { IsapreLogo } from "@/components/plan-card/isapre-logo";
import { PlanCardDetail } from "@/components/plan-card/plan-card-detail";
import {
  buildPlanPdfFileName,
  getPlanPdfDownloadUrl,
  planHasPdf,
} from "@/lib/plan-pdf";
import type { CurrencyDisplay } from "./public-results-toolbar";
import { MetricCell } from "./metric-cell";
import {
  AmbulatoryMetricIcon,
  ClinicMetricIcon,
  HospitalMetricIcon,
} from "./plan-card-icons";

export interface PublicPlanCardProps {
  plan: HealthPlan;
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  currency: CurrencyDisplay;
  onRequest: () => void;
}

function MetaDivider() {
  return (
    <span className="hidden text-border sm:inline" aria-hidden>
      ·
    </span>
  );
}

export function PublicPlanCard({
  plan,
  beneficiarySummary,
  ufToClp,
  currency,
  onRequest,
}: PublicPlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { hospitalaria, ambulatoria } = useMemo(
    () => splitCoverageByType(plan.coverage),
    [plan.coverage],
  );

  const hospitalPercentages = useMemo(
    () => formatCoveragePercentagesList(hospitalaria),
    [hospitalaria],
  );
  const ambulatoryPercentages = useMemo(
    () => formatCoveragePercentagesList(ambulatoria),
    [ambulatoria],
  );

  const planType = resolvePrimaryPlanType(plan);
  const planTypeLabel = PLAN_TYPE_LABELS[planType];
  const planTypeBadge = statusBadgeToneClass[planTypeBadgeTone[planType]];
  const commercialName = resolveCommercialPlanName(plan);

  const priceQuote = useMemo(
    () =>
      buildPlanFinalPriceQuote(
        plan.base_price_uf,
        beneficiarySummary,
        ufToClp,
      ),
    [plan.base_price_uf, beneficiarySummary, ufToClp],
  );

  const clinicCount = plan.coverage.length;
  const mainPrice =
    currency === "clp"
      ? formatPlanClp(priceQuote.finalPriceClp)
      : formatQuotedUf(priceQuote.finalPriceUf);
  const secondaryPrice =
    currency === "clp"
      ? formatQuotedUf(priceQuote.finalPriceUf)
      : formatPlanClp(priceQuote.finalPriceClp);

  function toggleClinics() {
    setExpanded((value) => !value);
  }

  return (
    <motion.article
      layout="position"
      className={joinClasses(
        "relative overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        ui.border,
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-secondary/60"
        aria-hidden
      />

      {/* Identidad + precio */}
      <div className="flex flex-col gap-4 p-4 pt-5 sm:p-5 sm:pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
          <IsapreLogo isapre={plan.isapre} size="md" />

          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-bold leading-snug text-primary-dark sm:text-lg">
              {commercialName}
            </h3>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] leading-none text-muted sm:text-xs">
              <span className="font-mono font-medium text-foreground/80">
                {plan.unique_code}
              </span>
              <MetaDivider />
              <span
                className={joinClasses(
                  "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:text-[11px]",
                  planTypeBadge,
                )}
              >
                {planTypeLabel}
              </span>
              {plan.has_top ? (
                <>
                  <MetaDivider />
                  <span
                    className={joinClasses(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                      statusBadgeToneClass.top,
                    )}
                  >
                    Tope 7.500 UF
                  </span>
                </>
              ) : null}
              <MetaDivider />
              <span>
                Base{" "}
                <span className="font-semibold tabular-nums text-foreground/90">
                  {formatQuotedUf(plan.base_price_uf)}
                </span>
              </span>
              <MetaDivider />
              <span>
                {beneficiarySummary.beneficiaryCount} beneficiario
                {beneficiarySummary.beneficiaryCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 lg:min-w-[10rem] lg:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Tu precio estimado
          </p>
          <p
            className={joinClasses(
              "mt-0.5 text-xl font-bold tabular-nums tracking-tight sm:text-2xl",
              accent.valuePrimary,
            )}
          >
            {mainPrice}
          </p>
          <p className="text-xs text-muted">
            <span>/ mes · </span>
            <span className={joinClasses("font-semibold", accent.valueSecondary)}>
              {secondaryPrice}
            </span>
          </p>
        </div>
      </div>

      {/* Cobertura resumida — clic abre clínicas */}
      <div
        className={joinClasses(
          "grid gap-3 border-t bg-surface-hover/25 px-3 py-3 sm:grid-cols-3 sm:gap-2 sm:px-4 sm:py-3.5",
          ui.border,
        )}
      >
        <MetricCell
          label="Hospitalaria"
          value={hospitalPercentages}
          icon={<HospitalMetricIcon />}
          tone="primary"
          valueClassName={accent.valuePrimary}
          onClick={toggleClinics}
          active={expanded}
        />
        <MetricCell
          label="Ambulatoria"
          value={ambulatoryPercentages}
          icon={<AmbulatoryMetricIcon />}
          tone="secondary"
          valueClassName={accent.valueSecondary}
          onClick={toggleClinics}
          active={expanded}
        />
        <MetricCell
          label="Prestadores"
          value={
            clinicCount > 0
              ? `${clinicCount} clínica${clinicCount === 1 ? "" : "s"}`
              : "Sin prestadores"
          }
          icon={<ClinicMetricIcon />}
          tone="warning"
          valueClassName={accent.valueWarning}
          onClick={toggleClinics}
          active={expanded}
        />
      </div>

      <GpuExpandPanel open={expanded}>
        <PlanCardDetail hospitalaria={hospitalaria} ambulatoria={ambulatoria} />
      </GpuExpandPanel>

      {/* Acciones */}
      <div
        className={joinClasses(
          "flex flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-5",
          ui.border,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={toggleClinics}
            className={joinClasses(
              touchTarget,
              "rounded-full border px-5 text-sm font-semibold text-foreground transition hover:border-secondary/40 hover:bg-secondary-muted/50 sm:min-w-36",
              ui.border,
              expanded ? "border-primary/30 bg-primary/5 text-primary-dark" : "",
            )}
            aria-expanded={expanded}
          >
            {expanded ? "Ocultar clínicas" : "Ver clínicas"}
          </button>

          {planHasPdf(plan) ? (
            <a
              href={getPlanPdfDownloadUrl(plan) ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              download={buildPlanPdfFileName(plan.unique_code)}
              className={joinClasses(
                touchTarget,
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold text-secondary transition hover:border-secondary/40 hover:bg-secondary-muted/60 sm:min-w-36",
                ui.border,
              )}
            >
              <span className="text-secondary">
                <DownloadIcon />
              </span>
              Descargar PDF
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                window.alert(
                  "El PDF de este plan estará disponible pronto. Aún no se ha cargado desde administración.",
                )
              }
              className={joinClasses(
                touchTarget,
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold text-muted transition hover:bg-surface-hover sm:min-w-36",
                ui.border,
              )}
            >
              <DownloadIcon />
              Descargar PDF
            </button>
          )}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onRequest}
          className={joinClasses(
            touchTarget,
            "rounded-full px-6 text-sm font-bold text-white shadow-[0_6px_20px_-6px_var(--primary)] sm:min-w-36",
            ui.cta,
          )}
        >
          Solicitar
        </motion.button>
      </div>
    </motion.article>
  );
}
