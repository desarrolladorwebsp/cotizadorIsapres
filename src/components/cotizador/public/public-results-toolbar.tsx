"use client";

import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type CurrencyDisplay = "clp" | "uf";

export interface PublicResultsToolbarProps {
  displayedCount: number;
  totalCount: number;
  currency: CurrencyDisplay;
  onCurrencyChange: (currency: CurrencyDisplay) => void;
  compactEmbed?: boolean;
}

export function PublicResultsToolbar({
  displayedCount,
  totalCount,
  currency,
  onCurrencyChange,
  compactEmbed = false,
}: PublicResultsToolbarProps) {
  const resultsLabel =
    displayedCount < totalCount
      ? `Mostrando ${displayedCount.toLocaleString("es-CL")} de ${totalCount.toLocaleString("es-CL")}`
      : `${totalCount.toLocaleString("es-CL")} resultados`;

  return (
    <div
      className={joinClasses(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        compactEmbed &&
          "max-md:flex-row max-md:flex-nowrap max-md:items-center max-md:justify-between max-md:gap-2",
      )}
    >
      <div
        className={joinClasses(
          "flex flex-wrap items-center gap-3 max-md:gap-2",
          compactEmbed && "max-md:min-w-0 max-md:flex-1",
        )}
      >
        <span
          className={joinClasses(
            "inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm",
            compactEmbed &&
              "max-md:max-w-full max-md:truncate max-md:px-2.5 max-md:py-1 max-md:text-[11px]",
          )}
        >
          {resultsLabel}
        </span>
        <span
          className={joinClasses(
            "text-xs font-medium text-primary-dark/80",
            compactEmbed && "max-md:hidden",
          )}
        >
          Orden: menor a mayor precio · Sin costo adicional
        </span>
      </div>

      <div
        className={joinClasses(
          "flex flex-wrap items-center gap-3 max-md:gap-2",
          compactEmbed && "max-md:shrink-0",
        )}
      >
        <div
          className={joinClasses(
            "inline-flex rounded-lg p-0.5",
            ui.borderHairline,
            compactEmbed && "max-md:rounded-md",
          )}
        >
          <button
            type="button"
            onClick={() => onCurrencyChange("clp")}
            className={joinClasses(
              touchTarget,
              "rounded-md px-3 text-xs font-bold transition",
              compactEmbed && "max-md:min-h-8 max-md:min-w-0 max-md:px-2.5",
              currency === "clp"
                ? "bg-primary text-white"
                : "text-muted hover:bg-surface-hover",
            )}
          >
            Pesos
          </button>
          <button
            type="button"
            onClick={() => onCurrencyChange("uf")}
            className={joinClasses(
              touchTarget,
              "rounded-md px-3 text-xs font-bold transition",
              compactEmbed && "max-md:min-h-8 max-md:min-w-0 max-md:px-2.5",
              currency === "uf"
                ? "bg-primary text-white"
                : "text-muted hover:bg-surface-hover",
            )}
          >
            UF
          </button>
        </div>
      </div>
    </div>
  );
}
