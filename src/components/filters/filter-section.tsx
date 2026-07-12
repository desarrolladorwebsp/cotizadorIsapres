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
  /** Acento de borde izquierdo en modo ejecutivo (legacy, sin efecto visual). */
  executiveAccent?: "primary" | "secondary" | "neutral";
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
  executiveVisual = false,
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
        )}
      >
        <div className="flex items-center gap-1.5">
          <h2
            className={joinClasses(
              compactEmbed && "max-md:text-[11px]",
              executiveVisual
                ? "text-xs font-semibold uppercase tracking-wide text-muted"
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
