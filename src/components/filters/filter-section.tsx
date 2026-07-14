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
  /** Tarjeta con borde acentuado (panel ejecutivo). */
  executiveVisual?: boolean;
  /** Acento de color en cabecera del filtro (panel ejecutivo). */
  executiveAccent?: "primary" | "secondary" | "neutral";
}

const executiveHeaderAccentClass: Record<
  NonNullable<FilterSectionProps["executiveAccent"]>,
  string
> = {
  primary:
    "border-l-[3px] border-l-primary bg-primary/12 text-primary-dark shadow-sm ring-1 ring-primary/15",
  secondary:
    "border-l-[3px] border-l-secondary bg-secondary-muted text-secondary shadow-sm ring-1 ring-secondary/20",
  neutral:
    "border-l-[3px] border-l-primary-dark/35 bg-primary-dark/[0.06] text-primary-dark shadow-sm ring-1 ring-primary-dark/10",
};

export function FilterSection({
  title,
  description,
  infoLabel,
  info,
  children,
  className,
  compactEmbed = false,
  hideDescription = false,
  executiveVisual = false,
  executiveAccent = "primary",
}: FilterSectionProps) {
  return (
    <section
      className={joinClasses(
        "min-w-0 py-4",
        compactEmbed && "max-md:py-3",
        className,
      )}
    >
      <header
        className={joinClasses(
          "mb-2.5 space-y-0.5",
          compactEmbed && "max-md:mb-2",
          executiveVisual &&
            joinClasses(
              "mb-3 rounded-lg px-2.5 py-2",
              executiveHeaderAccentClass[executiveAccent],
            ),
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={joinClasses(
              compactEmbed && "max-md:text-[11px]",
              executiveVisual
                ? "text-xs font-bold uppercase tracking-wide"
                : joinClasses(
                    "text-[13px] font-bold tracking-tight",
                    ui.sectionTitle,
                  ),
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
              "text-[11px] leading-relaxed",
              executiveVisual ? "text-current/70" : "text-muted",
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
