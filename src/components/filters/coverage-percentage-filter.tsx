"use client";

import { COVERAGE_PERCENTAGE_OPTIONS } from "@/domain";
import {
  percentageToneActiveClass,
  type PercentageTone,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { CoveragePercentageOption } from "@/domain";

export interface CoveragePercentageFilterProps {
  title: string;
  value: CoveragePercentageOption | null;
  tone?: PercentageTone;
  onChange: (value: CoveragePercentageOption | null) => void;
  compactEmbed?: boolean;
}

const percentButtonClass = joinClasses(
  touchTarget,
  "h-12 w-full rounded-lg text-xs font-bold tabular-nums md:h-9 md:min-h-0 md:min-w-0",
);

export function CoveragePercentageFilter({
  title,
  value,
  tone = "neutral",
  onChange,
  compactEmbed = false,
}: CoveragePercentageFilterProps) {
  const isAllActive = value === null;
  const activeClass = percentageToneActiveClass[tone];

  return (
    <div
      className={joinClasses(
        "space-y-3 rounded-xl border border-border/70 bg-white/70 p-3",
        compactEmbed && "max-md:space-y-2 max-md:p-2.5",
      )}
    >
      <p
        className={joinClasses(
          "text-xs font-semibold text-primary-dark/80",
          compactEmbed && "max-md:text-[11px]",
        )}
      >
        {title}
      </p>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={joinClasses(
            "col-span-3 sm:col-span-2",
            percentButtonClass,
            ui.borderHairline,
            isAllActive
              ? activeClass
              : joinClasses("text-muted", ui.hoverSurface),
          )}
          aria-pressed={isAllActive}
        >
          Todos
        </button>

        {COVERAGE_PERCENTAGE_OPTIONS.map((percent) => {
          const isActive = value === percent;

          return (
            <button
              key={percent}
              type="button"
              onClick={() => onChange(percent)}
              className={joinClasses(
                percentButtonClass,
                ui.borderHairline,
                isActive
                  ? activeClass
                  : joinClasses("text-foreground/75", ui.hoverSurface),
              )}
              aria-pressed={isActive}
              aria-label={`Filtrar ${percent}%`}
            >
              {percent}%
            </button>
          );
        })}
      </div>
    </div>
  );
}
