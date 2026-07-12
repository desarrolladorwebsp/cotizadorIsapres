"use client";

import { formatPlanClp, formatPlanUf } from "@/domain";
import { FilterSection } from "./filter-section";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { FilterHelpBlock } from "./filter-info-tip";

export interface PriceFilterSectionProps {
  priceMin: number;
  priceMax: number;
  ufToClp: number;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  compactEmbed?: boolean;
  hideHelperText?: boolean;
}

export function PriceFilterSection({
  priceMin,
  priceMax,
  ufToClp,
  onPriceMinChange,
  onPriceMaxChange,
  compactEmbed = false,
  hideHelperText = false,
}: PriceFilterSectionProps) {
  return (
    <FilterSection
      title="Precio"
      description="Ajusta el rango de precio en UF. Los resultados se actualizan al instante."
      compactEmbed={compactEmbed}
      hideDescription={hideHelperText}
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
          <span className="rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary-dark">
            {formatPlanClp(priceMin * ufToClp)} –{" "}
            {formatPlanClp(priceMax * ufToClp)}
          </span>
        </div>
        <input
          type="range"
          min={2}
          max={8}
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
          min={2}
          max={8}
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
