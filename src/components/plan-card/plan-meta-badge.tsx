import {
  planTypeBadgeTone,
  statusBadgeToneClass,
  type StatusBadgeTone,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PlanTypeFilterId } from "@/types/filters";

export interface PlanMetaBadgeProps {
  label: string;
  tone?: StatusBadgeTone;
  planType?: PlanTypeFilterId;
  className?: string;
}

const pillBase =
  "inline-flex shrink-0 items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-wide";

export function PlanMetaBadge({
  label,
  tone = "neutral",
  planType,
  className,
}: PlanMetaBadgeProps) {
  const resolvedTone = planType
    ? planTypeBadgeTone[planType]
    : tone;

  return (
    <span
      className={joinClasses(
        pillBase,
        "tabular-nums",
        statusBadgeToneClass[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
}
