"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CoverageColumnCompact } from "@/components/plan-card/coverage-column-compact";
import {
  AmbulatoryCoverageIcon,
  HospitalCoverageIcon,
} from "@/components/plan-card/coverage-column-icons";
import { ChatIcon, DownloadIcon } from "@/components/plan-card/icons";
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
  motionGpu,
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

const planCardShadowRest =
  "0 1px 2px rgb(0 0 0 / 0.04), 0 6px 20px -4px rgb(0 0 0 / 0.1)";

const planCardShadowHover =
  "0 0 0 1px var(--primary), var(--shadow-card-hover)";

const metaChip =
  "inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-semibold leading-tight sm:text-[11px]";

const planMetaStyles = {
  code: joinClasses(
    metaChip,
    ui.borderHairline,
    "bg-surface-hover font-mono text-[10px] font-medium normal-case tracking-wide text-foreground/70",
  ),
  base: joinClasses(
    metaChip,
    "border-primary/20 bg-primary/5 text-primary-dark",
  ),
  top: joinClasses(
    metaChip,
    "border-primary/30 bg-primary text-primary-foreground shadow-sm",
  ),
} as const;

const planTypeMetaStyle: Record<PlanTypeFilterId, string> = {
  preferred: joinClasses(
    metaChip,
    "border-amber-300/60 bg-amber-50 text-amber-950",
  ),
  closed: joinClasses(
    metaChip,
    "border-secondary/35 bg-secondary-muted text-secondary",
  ),
  free_choice: joinClasses(
    metaChip,
    ui.borderHairline,
    "bg-white text-muted",
  ),
};

const planActionBase = joinClasses(
  touchTarget,
  "inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition active:scale-[0.98]",
);

const planActionIconCircle =
  "flex size-5 shrink-0 items-center justify-center rounded-full [&_svg]:size-3.5";

function PlanCardActionButton({
  label,
  icon,
  variant,
  onClick,
  href,
  download,
  target,
  rel,
  title,
}: {
  label: string;
  icon: ReactNode;
  variant: "primary" | "secondary";
  onClick?: () => void;
  href?: string;
  download?: string;
  target?: string;
  rel?: string;
  title?: string;
}) {
  const isPrimary = variant === "primary";

  const className = joinClasses(
    planActionBase,
    isPrimary
      ? joinClasses(
          ui.cta,
          "shadow-[var(--shadow-cta)] hover:brightness-105",
        )
      : joinClasses(
          ui.border,
          "border bg-white text-foreground shadow-sm hover:border-primary/35 hover:bg-primary/5 hover:text-primary-dark",
        ),
  );

  const iconClassName = joinClasses(
    planActionIconCircle,
    isPrimary
      ? "bg-white/20 text-primary-foreground"
      : "bg-primary/10 text-primary-dark",
  );

  const content = (
    <>
      <span className={iconClassName} aria-hidden>
        {icon}
      </span>
      {label}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        download={download}
        target={target}
        rel={rel}
        title={title}
        aria-label={title ?? label}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title ?? label}
      className={className}
    >
      {content}
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
  const [isHovered, setIsHovered] = useState(false);
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
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        y: isHovered ? -4 : 0,
        borderColor: isHovered ? "var(--primary)" : "var(--border)",
        boxShadow: isHovered ? planCardShadowHover : planCardShadowRest,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={joinClasses(
        motionGpu,
        "overflow-hidden rounded-xl border bg-white",
      )}
    >
      {/* Cabecera — hero del plan */}
      <div
        className={joinClasses(
          "flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4",
          ui.border,
          "bg-white",
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
          <IsapreLogo isapre={plan.isapre} size="sm" />

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-bold uppercase leading-snug tracking-wide text-primary-dark sm:text-sm">
              {commercialName}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className={planMetaStyles.code} title="Código del plan">
                {plan.unique_code}
              </span>
              <span className={planMetaStyles.base} title="Precio base en UF">
                <span className="font-normal text-primary-dark/70">Base</span>
                <span className="font-bold tabular-nums">
                  {formatQuotedUf(plan.base_price_uf).replace("UF ", "")} UF
                </span>
              </span>
              <span className={planTypeMetaStyle[planType]}>{planTypeLabel}</span>
              {plan.has_top ? (
                <span className={planMetaStyles.top}>Top</span>
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

          <div className="flex items-center gap-2">
            {planHasPdf(plan) ? (
              <PlanCardActionButton
                label="PDF"
                icon={<DownloadIcon />}
                variant="secondary"
                href={getPlanPdfDownloadUrl(plan) ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                download={buildPlanPdfFileName(plan.unique_code)}
                title="Descargar PDF del plan"
              />
            ) : null}
            <PlanCardActionButton
              label="Solicitar"
              icon={<ChatIcon />}
              variant="primary"
              onClick={onRequest}
              title="Solicitar cotización del plan"
            />
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
