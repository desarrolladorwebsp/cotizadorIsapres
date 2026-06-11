"use client";

import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { FilterInfoTip } from "./filter-info-tip";

export interface FilterSectionProps {
  title: string;
  description?: string;
  infoLabel?: string;
  info?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({
  title,
  description,
  infoLabel,
  info,
  children,
  className,
}: FilterSectionProps) {
  return (
    <section className={joinClasses(ui.surfaceCard, "p-5 sm:p-6", className)}>
      <header className="mb-5 space-y-1">
        <div className="flex items-center gap-1.5">
          <h2
            className={joinClasses(
              "text-sm font-bold tracking-tight",
              ui.sectionTitle,
            )}
          >
            {title}
          </h2>
          {info ? (
            <FilterInfoTip label={infoLabel ?? `Más información: ${title}`}>
              {info}
            </FilterInfoTip>
          ) : null}
        </div>
        {description ? (
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
