import { formatRiskFactor } from "@/lib/risk-factor-table-604";
import { joinClasses } from "@/lib/utils";

export interface FactorBadgeProps {
  factor: number | null;
  className?: string;
}

export function FactorBadge({ factor, className }: FactorBadgeProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex min-w-[3rem] shrink-0 items-center justify-center rounded-full border border-[hsl(var(--brand)/0.3)] bg-brand-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-brand",
        !factor && "border-border bg-background text-muted",
        className,
      )}
      aria-label={
        factor !== null
          ? `Factor de riesgo ${formatRiskFactor(factor)}`
          : "Factor de riesgo no disponible"
      }
    >
      {factor !== null ? formatRiskFactor(factor) : "—"}
    </span>
  );
}
