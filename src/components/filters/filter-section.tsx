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
  /** Oculta descripciones y reduce padding en widget móvil. */
  compactEmbed?: boolean;
}

export function FilterSection({
  title,
  description,
  infoLabel,
  info,
  children,
  className,
  compactEmbed = false,
}: FilterSectionProps) {
  return (
    <section
      className={joinClasses(
        ui.surfaceCard,
        "p-5 sm:p-6",
        compactEmbed && "max-md:p-3",
        className,
      )}
    >
      <header className={joinClasses("mb-5 space-y-1", compactEmbed && "max-md:mb-3")}>
        <div className="flex items-center gap-1.5">
          <h2
            className={joinClasses(
              "text-sm font-bold tracking-tight",
              compactEmbed && "max-md:text-xs",
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
          <p
            className={joinClasses(
              "text-xs leading-relaxed text-muted",
              compactEmbed && "max-md:hidden",
            )}
          >
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
