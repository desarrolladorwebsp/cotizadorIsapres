import { formatPlanClp, formatPlanUf, planPriceClp } from "@/lib/plan-format";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { HealthPlan } from "@/types/plan";
import { IsapreLogo } from "./isapre-logo";
import { StatusBadge } from "./status-badge";

export interface PlanCardHeaderProps {
  plan: HealthPlan;
  badges: string[];
  ufToClp?: number;
  className?: string;
}

export function PlanCardHeader({
  plan,
  badges,
  ufToClp,
  className,
}: PlanCardHeaderProps) {
  const priceClp = planPriceClp(plan.base_price_uf, ufToClp);

  return (
    <header
      className={joinClasses(
        "flex flex-col gap-6 border-b px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-start lg:justify-between",
        ui.border,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <IsapreLogo isapre={plan.isapre} />

        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            {plan.isapre}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl">
              {plan.plan_name}
            </h3>
            {badges.map((badge) => (
              <StatusBadge key={badge} label={badge} />
            ))}
          </div>

          <p className="text-sm text-muted">
            Código{" "}
            <span className="font-medium text-foreground/80">
              {plan.unique_code}
            </span>
          </p>

          {plan.additional_notes ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted/90">
              {plan.additional_notes}
            </p>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-left lg:text-right">
        <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[1.75rem] sm:leading-none">
          {formatPlanUf(plan.base_price_uf)}
        </p>
        <p className="mt-1.5 text-sm text-muted">
          ≈ {formatPlanClp(priceClp)}{" "}
          <span className="text-muted/70">/ mes</span>
        </p>
      </div>
    </header>
  );
}
