import { formatPlanClp, formatQuotedUf } from "@/domain";
import type { PlanFinalPriceQuote } from "@/domain";
import {
  formatBasePriceBadgeLabel,
  PLAN_TYPE_LABELS,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
} from "@/domain";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { HealthPlan } from "@/domain";
import { IsapreLogo } from "./isapre-logo";
import { PlanMetaBadge } from "./plan-meta-badge";

export interface PlanCardHeaderProps {
  plan: HealthPlan;
  priceQuote: PlanFinalPriceQuote;
  className?: string;
}

export function PlanCardHeader({
  plan,
  priceQuote,
  className,
}: PlanCardHeaderProps) {
  const commercialName = resolveCommercialPlanName(plan);
  const planType = resolvePrimaryPlanType(plan);
  const planTypeLabel = PLAN_TYPE_LABELS[planType];
  const basePriceLabel = formatBasePriceBadgeLabel(plan.base_price_uf);

  return (
    <header
      className={joinClasses(
        "flex flex-col gap-5 border-b bg-white px-5 py-5 sm:gap-6 sm:px-6 sm:py-6",
        "lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-7",
        ui.border,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
        <IsapreLogo isapre={plan.isapre} size="lg" />

        <div className="min-w-0 flex-1 space-y-2.5">
          <h3 className="text-lg font-bold leading-tight tracking-tight text-primary-dark sm:text-xl lg:text-[1.35rem]">
            {commercialName}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="font-mono text-xs tabular-nums tracking-tight text-muted sm:text-[13px]"
              title="Código único del plan"
            >
              {plan.unique_code}
            </span>

            <span className="hidden h-3.5 w-px bg-border sm:inline" aria-hidden />

            <PlanMetaBadge label={basePriceLabel} tone="base" />

            <PlanMetaBadge label={planTypeLabel} planType={planType} />
          </div>
        </div>
      </div>

      <div
        className={joinClasses(
          "flex shrink-0 flex-col border-t pt-4 sm:min-w-[11rem]",
          "lg:border-t-0 lg:pt-0 lg:items-end lg:text-right",
          ui.border,
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Desde
        </p>
        <p className="mt-0.5 text-[1.75rem] font-bold leading-none tabular-nums tracking-tight text-primary-dark sm:text-3xl">
          {formatQuotedUf(priceQuote.finalPriceUf)}
        </p>
        <p className="mt-2 text-sm font-medium tabular-nums text-muted">
          {formatPlanClp(priceQuote.finalPriceClp)}{" "}
          <span className="font-normal text-muted/75">/ mes</span>
        </p>
      </div>
    </header>
  );
}
