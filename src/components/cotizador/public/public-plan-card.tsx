"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CoverageColumnCompact } from "@/components/plan-card/coverage-column-compact";
import {
  AmbulatoryCoverageIcon,
  HospitalCoverageIcon,
} from "@/components/plan-card/coverage-column-icons";
import { DownloadIcon } from "@/components/plan-card/icons";
import { IsapreLogo } from "@/components/plan-card/isapre-logo";
import {
  buildPlanFinalPriceQuote,
  formatPlanClp,
  formatQuotedUf,
  PLAN_TYPE_LABELS,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
  splitCoverageByType,
} from "@/domain";
import { useInView } from "@/hooks/use-in-view";
import { usePlanDetail } from "@/hooks/use-plan-detail";
import {
  accent,
  statusBadgeToneClass,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlanSummary } from "@/domain";
import type { PlanTypeFilterId } from "@/types/filters";
import {
  buildPlanPdfFileName,
  getPlanPdfDownloadUrl,
  planHasPdf,
} from "@/lib/plan-pdf";
import type { CurrencyDisplay } from "./public-results-toolbar";

export interface PublicPlanCardProps {
  plan: HealthPlanSummary;
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  currency: CurrencyDisplay;
  onRequest: () => void;
}

type ActionIconVariant = "pdf" | "request";

const planTagPill =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase leading-none sm:text-[11px]";

const planTagStyles = {
  id: joinClasses(
    planTagPill,
    ui.borderHairline,
    "bg-surface-hover font-mono normal-case tracking-tight text-muted",
  ),
  base: joinClasses(
    planTagPill,
    "border-primary/25 bg-primary/10 text-primary-dark",
  ),
  top: joinClasses(planTagPill, statusBadgeToneClass.top),
} as const;

const planTypeTagStyle: Record<PlanTypeFilterId, string> = {
  preferred: joinClasses(planTagPill, statusBadgeToneClass.preferred),
  closed: joinClasses(planTagPill, statusBadgeToneClass.closed),
  free_choice: joinClasses(planTagPill, statusBadgeToneClass.free_choice),
};

const actionIconStyles: Record<
  ActionIconVariant,
  { circle: string; label: string }
> = {
  pdf: {
    circle: joinClasses(
      accent.iconDanger,
      "border border-accent-danger/30",
    ),
    label: "text-accent-danger",
  },
  request: {
    circle: joinClasses(
      accent.iconPrimary,
      "border border-primary/25",
    ),
    label: "text-primary-dark",
  },
};

function ActionIconShell({
  label,
  variant,
  children,
}: {
  label: string;
  variant: ActionIconVariant;
  children: React.ReactNode;
}) {
  const styles = actionIconStyles[variant];

  return (
    <div className="flex flex-col items-center gap-0.5 px-0 py-0.5">
      <span
        className={joinClasses(
          "flex size-9 shrink-0 items-center justify-center rounded-full border p-0 leading-none [&_svg]:size-5",
          styles.circle,
        )}
      >
        {children}
      </span>
      <span
        className={joinClasses(
          "text-[9px] font-bold uppercase tracking-wide sm:text-[10px]",
          styles.label,
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ActionIconButton({
  label,
  variant,
  onClick,
  children,
}: {
  label: string;
  variant: ActionIconVariant;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={joinClasses(
        touchTarget,
        "rounded-lg p-0 transition hover:brightness-95 active:scale-[0.98]",
      )}
    >
      <ActionIconShell label={label} variant={variant}>
        {children}
      </ActionIconShell>
    </button>
  );
}

export function PublicPlanCard({
  plan,
  beneficiarySummary,
  ufToClp,
  currency,
  onRequest,
}: PublicPlanCardProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const { plan: detailPlan, loading: detailLoading } = usePlanDetail(
    plan.unique_code,
    inView,
  );

  const { hospitalaria, ambulatoria } = useMemo(() => {
    if (!detailPlan) {
      return { hospitalaria: [], ambulatoria: [] };
    }
    return splitCoverageByType(detailPlan.coverage);
  }, [detailPlan]);

  const planType = resolvePrimaryPlanType(plan);
  const planTypeLabel = PLAN_TYPE_LABELS[planType];
  const commercialName = resolveCommercialPlanName(plan).toUpperCase();

  const priceQuote = useMemo(
    () =>
      buildPlanFinalPriceQuote(
        plan.base_price_uf,
        beneficiarySummary,
        ufToClp,
      ),
    [plan.base_price_uf, beneficiarySummary, ufToClp],
  );

  const ufPriceLabel = formatQuotedUf(priceQuote.finalPriceUf);
  const clpPriceLabel = formatPlanClp(priceQuote.finalPriceClp);

  return (
    <motion.article
      ref={ref}
      layout="position"
      className={joinClasses(
        ui.surfaceCard,
        "overflow-hidden transition-shadow hover:shadow-card-hover",
      )}
    >
      {/* Cabecera — hero del plan */}
      <div
        className={joinClasses(
          "flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4",
          ui.border,
          "bg-surface-hover",
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
          <IsapreLogo isapre={plan.isapre} size="sm" />

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-bold uppercase leading-snug tracking-wide text-primary-dark sm:text-sm">
              {commercialName}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={planTagStyles.id}>{plan.unique_code}</span>
              <span className={planTagStyles.base}>
                Base {formatQuotedUf(plan.base_price_uf).replace("UF ", "")}
              </span>
              <span className={planTypeTagStyle[planType]}>{planTypeLabel}</span>
              {plan.has_top ? (
                <span className={planTagStyles.top}>Top</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center">
              <p className="text-[10px] font-medium text-muted">Desde</p>
              <p
                className={joinClasses(
                  "font-bold tabular-nums text-primary-dark",
                  currency === "uf"
                    ? "text-base sm:text-lg"
                    : "text-sm text-primary-dark/75 sm:text-base",
                )}
              >
                {ufPriceLabel}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium text-muted">Desde</p>
              <p
                className={joinClasses(
                  "font-bold tabular-nums text-primary-dark",
                  currency === "clp"
                    ? "text-base sm:text-lg"
                    : "text-sm text-primary-dark/75 sm:text-base",
                )}
              >
                {clpPriceLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {planHasPdf(plan) ? (
              <a
                href={getPlanPdfDownloadUrl(plan) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                download={buildPlanPdfFileName(plan.unique_code)}
                title="Descargar PDF"
                aria-label="Descargar PDF"
                className={joinClasses(
                  touchTarget,
                  "rounded-lg p-0 transition hover:brightness-95",
                )}
              >
                <ActionIconShell label="PDF" variant="pdf">
                  <DownloadIcon />
                </ActionIconShell>
              </a>
            ) : (
              <ActionIconButton
                label="PDF"
                variant="pdf"
                onClick={() =>
                  window.alert(
                    "El PDF de este plan estará disponible pronto.",
                  )
                }
              >
                <DownloadIcon />
              </ActionIconButton>
            )}
            <ActionIconButton label="Solicitar" variant="request" onClick={onRequest}>
              <span className="text-lg font-bold leading-none">✉</span>
            </ActionIconButton>
          </div>
        </div>
      </div>

      {/* Coberturas — estilo competencia: 1 barra + lista */}
      <div className="grid bg-white md:grid-cols-2">
        <CoverageColumnCompact
          title="Cobertura hospitalaria"
          icon={<HospitalCoverageIcon />}
          entries={hospitalaria}
          fallbackPercentages={plan.coverage_summary.hospital_percentages}
          barClassName="bg-primary"
          percentClassName="text-primary-dark"
          headerClassName="text-primary-dark/80"
          badgeClassName="border border-primary/25 bg-primary/10 text-primary-dark"
          showDivider
          initialVisible={4}
        />
        <CoverageColumnCompact
          title="Cobertura ambulatoria"
          icon={<AmbulatoryCoverageIcon />}
          entries={ambulatoria}
          fallbackPercentages={plan.coverage_summary.ambulatory_percentages}
          barClassName="bg-secondary"
          percentClassName="text-secondary"
          headerClassName="text-secondary"
          badgeClassName="border border-secondary/35 bg-secondary-muted text-secondary"
          initialVisible={4}
        />
      </div>

      {detailLoading && inView ? (
        <p
          className={joinClasses(
            "border-t bg-white px-3 py-2 text-center text-[11px] text-muted",
            ui.border,
          )}
        >
          Cargando prestadores…
        </p>
      ) : null}
    </motion.article>
  );
}
