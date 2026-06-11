"use client";

import {
  SORT_OPTIONS,
  type QuoteSortKey,
} from "@/lib/quote-criteria-options";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type CurrencyDisplay = "clp" | "uf";

export interface PublicResultsToolbarProps {
  displayedCount: number;
  totalCount: number;
  sortKey: QuoteSortKey;
  onSortChange: (key: QuoteSortKey) => void;
  currency: CurrencyDisplay;
  onCurrencyChange: (currency: CurrencyDisplay) => void;
}

export function PublicResultsToolbar({
  displayedCount,
  totalCount,
  sortKey,
  onSortChange,
  currency,
  onCurrencyChange,
}: PublicResultsToolbarProps) {
  const resultsLabel =
    displayedCount < totalCount
      ? `Mostrando ${displayedCount.toLocaleString("es-CL")} de ${totalCount.toLocaleString("es-CL")}`
      : `${totalCount.toLocaleString("es-CL")} resultados`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-sm">
          {resultsLabel}
        </span>
        <span className="text-xs font-medium text-primary-dark/80">
          Precios directos · Sin costo adicional
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-muted">
          Ordenar por
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as QuoteSortKey)}
            className={joinClasses(
              "h-9 rounded-lg px-3 text-sm font-medium text-foreground",
              ui.input,
            )}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className={joinClasses(
            "inline-flex rounded-lg p-0.5",
            ui.borderHairline,
          )}
        >
          <button
            type="button"
            onClick={() => onCurrencyChange("clp")}
            className={joinClasses(
              touchTarget,
              "rounded-md px-3 text-xs font-bold transition",
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
