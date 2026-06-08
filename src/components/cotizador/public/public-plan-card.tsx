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
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";
import { DownloadIcon } from "@/components/plan-card/icons";
import { IsapreLogo } from "@/components/plan-card/isapre-logo";
import { PlanCardDetail } from "@/components/plan-card/plan-card-detail";
import { getPlanPdfDownloadUrl } from "@/lib/plan-pdf";
import type { CurrencyDisplay } from "./public-results-toolbar";

export interface PublicPlanCardProps {
  plan: HealthPlan;
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  currency: CurrencyDisplay;
  onRequest: () => void;
}

function InfoCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={joinClasses("min-w-0", className)}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
        {value}
      </p>
    </div>
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

  return (
    <motion.article
      layout="position"
      className={joinClasses(
        "overflow-hidden rounded-2xl border bg-white shadow-card transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        ui.border,
      )}
    >
      {/* Identidad + precio */}
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <IsapreLogo isapre={plan.isapre} size="md" />

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h3 className="text-base font-bold leading-snug text-primary-dark sm:text-lg">
                {commercialName}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted">
                {plan.unique_code}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={joinClasses(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                  planType === "preferred"
                    ? "bg-secondary-muted text-secondary"
                    : "bg-surface-hover text-muted",
                )}
              >
                {planTypeLabel}
              </span>
              {plan.has_top ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary-dark">
                  Tope 7.500 UF
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={joinClasses(
            "shrink-0 rounded-xl bg-primary/5 px-4 py-3 lg:min-w-[11rem] lg:text-right",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Tu precio estimado
          </p>
          <p className="mt-0.5 text-2xl font-black tabular-nums tracking-tight text-primary-dark">
            {mainPrice}
          </p>
          <p className="text-xs text-muted">/ mes · {secondaryPrice}</p>
          <p className="mt-2 text-xs text-muted">
            Base {formatQuotedUf(plan.base_price_uf)} ·{" "}
            {beneficiarySummary.beneficiaryCount} beneficiario
            {beneficiarySummary.beneficiaryCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Cobertura resumida — sin repetir datos */}
      <div
        className={joinClasses(
          "grid gap-4 border-t bg-surface-hover/25 px-4 py-4 sm:grid-cols-3 sm:px-5",
          ui.border,
        )}
      >
        <InfoCell label="Hospitalaria" value={hospitalPercentages} />
        <InfoCell label="Ambulatoria" value={ambulatoryPercentages} />
        <InfoCell
          label="Prestadores"
          value={
            clinicCount > 0
              ? `${clinicCount} clínica${clinicCount === 1 ? "" : "s"}`
              : "Sin prestadores"
          }
        />
      </div>

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
            onClick={() => setExpanded((v) => !v)}
            className={joinClasses(
              touchTarget,
              "rounded-full border px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover sm:min-w-36",
              ui.border,
            )}
          >
            {expanded ? "Ocultar clínicas" : "Ver clínicas"}
          </button>

          {plan.pdf_url ? (
            <a
              href={getPlanPdfDownloadUrl(plan.pdf_url)}
              target="_blank"
              rel="noopener noreferrer"
              download
              className={joinClasses(
                touchTarget,
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover sm:min-w-36",
                ui.border,
              )}
            >
              <DownloadIcon />
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
                "inline-flex items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold text-foreground transition hover:bg-surface-hover sm:min-w-36",
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

      <GpuExpandPanel open={expanded}>
        <PlanCardDetail hospitalaria={hospitalaria} ambulatoria={ambulatoria} />
      </GpuExpandPanel>
    </motion.article>
  );
}
