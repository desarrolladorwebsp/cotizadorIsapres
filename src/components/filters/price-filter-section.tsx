"use client";

import { formatPlanClp, formatPlanUf } from "@/domain";
import { joinClasses } from "@/lib/utils";
import { FilterSection } from "./filter-section";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { FilterHelpBlock } from "./filter-info-tip";

export interface PriceFilterSectionProps {
  priceMin: number;
  priceMax: number;
  ufToClp: number;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  rangeMin?: number;
  rangeMax?: number;
  compactEmbed?: boolean;
  hideHelperText?: boolean;
  executiveVisual?: boolean;
}

export function PriceFilterSection({
  priceMin,
  priceMax,
  ufToClp,
  onPriceMinChange,
  onPriceMaxChange,
  rangeMin = 2,
  rangeMax = 8,
  compactEmbed = false,
  hideHelperText = false,
  executiveVisual = false,
}: PriceFilterSectionProps) {
  const sliderMin = Math.min(rangeMin, rangeMax);
  const sliderMax = Math.max(rangeMin, rangeMax);

  return (
    <FilterSection
      title="Precio"
      description="Ajusta el rango de precio en UF. Los resultados se actualizan al instante."
      compactEmbed={compactEmbed}
      hideDescription={hideHelperText}
      executiveVisual={executiveVisual}
      executiveAccent="primary"
      infoLabel="Información sobre filtro de precio"
      info={
        <FilterHelpBlock
          title="Rango de precio"
          paragraphs={[
            "El precio mostrado corresponde al plan base en UF antes de factores de riesgo y cargas.",
            "Usa los controles para acotar los planes según tu presupuesto.",
          ]}
        />
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-muted">Rango seleccionado</span>
          <span
            className={joinClasses(
              "rounded-md px-2 py-0.5 text-[10px] font-bold tabular-nums",
              executiveVisual
                ? "bg-surface-hover text-primary-dark"
                : "bg-primary/8 text-primary-dark",
            )}
          >
            {formatPlanClp(priceMin * ufToClp)} –{" "}
            {formatPlanClp(priceMax * ufToClp)}
          </span>
        </div>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={0.1}
          value={priceMin}
          onChange={(event) =>
            onPriceMinChange(Math.min(Number(event.target.value), priceMax))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          aria-label="Precio mínimo"
        />
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={0.1}
          value={priceMax}
          onChange={(event) =>
            onPriceMaxChange(Math.max(Number(event.target.value), priceMin))
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          aria-label="Precio máximo"
        />
        <p className="text-[11px] text-muted">
          {formatPlanUf(priceMin)} – {formatPlanUf(priceMax)} UF
        </p>
      </div>
    </FilterSection>
  );
}
