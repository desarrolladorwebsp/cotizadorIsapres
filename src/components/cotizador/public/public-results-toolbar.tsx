"use client";

import { safeWidth, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type CurrencyDisplay = "clp" | "uf";

export interface PublicResultsToolbarProps {
  displayedCount: number;
  totalCount: number;
  currency: CurrencyDisplay;
  onCurrencyChange: (currency: CurrencyDisplay) => void;
  searchText: string;
  onSearchTextChange: (value: string) => void;
  searchPlaceholder?: string;
  compactEmbed?: boolean;
}

export function PublicResultsToolbar({
  displayedCount,
  totalCount,
  currency,
  onCurrencyChange,
  searchText,
  onSearchTextChange,
  searchPlaceholder = "Buscar por nombre, código o Isapre...",
  compactEmbed = false,
}: PublicResultsToolbarProps) {
  const resultsLabel =
    displayedCount < totalCount
      ? `Mostrando ${displayedCount.toLocaleString("es-CL")} de ${totalCount.toLocaleString("es-CL")}`
      : `${totalCount.toLocaleString("es-CL")} resultados`;

  return (
    <div
      className={joinClasses(
        safeWidth,
        "flex flex-col gap-3",
        "lg:flex-row lg:items-center lg:gap-4",
        compactEmbed && "max-md:gap-2",
      )}
    >
      <div
        className={joinClasses(
          "flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1",
          "lg:max-w-[min(100%,22rem)] lg:shrink-0",
          compactEmbed && "max-md:gap-1",
        )}
      >
        <span
          className={joinClasses(
            "inline-flex w-fit max-w-full items-center rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm",
            compactEmbed &&
              "max-md:truncate max-md:px-2.5 max-md:py-1 max-md:text-[11px]",
          )}
        >
          {resultsLabel}
        </span>
        <span
          className={joinClasses(
            "text-xs font-medium leading-snug text-primary-dark/80",
            compactEmbed && "max-md:text-[10px]",
          )}
        >
          Orden: menor a mayor precio · Sin costo adicional
        </span>
      </div>

      <input
        type="search"
        value={searchText}
        onChange={(event) => onSearchTextChange(event.target.value)}
        placeholder={searchPlaceholder}
        className={joinClasses(
          "h-11 w-full min-w-0 rounded-xl px-4 text-sm",
          "lg:min-w-[12rem] lg:flex-1",
          compactEmbed && "max-md:h-9 max-md:rounded-lg max-md:px-3 max-md:text-xs",
          ui.input,
        )}
      />

      <div
        className={joinClasses(
          "flex shrink-0 items-center",
          compactEmbed ? "max-md:self-start" : "self-start lg:self-center",
        )}
      >
        <div
          className={joinClasses(
            "inline-flex rounded-lg p-0.5",
            ui.borderHairline,
            compactEmbed && "max-md:rounded-md",
          )}
          role="group"
          aria-label="Moneda de visualización"
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
