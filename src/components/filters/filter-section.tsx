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
  /** Oculta el texto descriptivo bajo el título de la sección. */
  hideDescription?: boolean;
}

export function FilterSection({
  title,
  description,
  infoLabel,
  info,
  children,
  className,
  compactEmbed = false,
  hideDescription = false,
}: FilterSectionProps) {
  return (
    <section className={joinClasses("min-w-0 py-4", compactEmbed && "max-md:py-3", className)}>
      <header
        className={joinClasses(
          "mb-3 space-y-0.5",
          compactEmbed && "max-md:mb-2",
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={joinClasses(
              "text-[13px] font-bold tracking-tight",
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
        {description && !hideDescription ? (
          <p
            className={joinClasses(
              "text-[11px] leading-relaxed text-muted",
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
