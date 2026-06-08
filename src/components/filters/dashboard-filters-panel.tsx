"use client";

import {
  createDefaultDashboardFilters,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  toggleCheckboxFilter,
  ZONE_FILTER_OPTIONS,
} from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { DashboardFiltersState } from "@/domain";
import { CoveragePercentageFilter } from "./coverage-percentage-filter";
import { FilterCheckboxList } from "./filter-checkbox-list";
import { FilterSection } from "./filter-section";

export interface DashboardFiltersPanelProps {
  value: DashboardFiltersState;
  onChange: (next: DashboardFiltersState) => void;
  className?: string;
}

export function DashboardFiltersPanel({
  value,
  onChange,
  className,
}: DashboardFiltersPanelProps) {
  function update(partial: Partial<DashboardFiltersState>) {
    onChange({ ...value, ...partial });
  }

  function clearAllFilters() {
    onChange(createDefaultDashboardFilters());
  }

  return (
    <div className={className}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={clearAllFilters}
          className={joinClasses(
            "inline-flex items-center gap-1.5 rounded-lg px-4 text-xs font-semibold",
            touchTarget,
            ui.dangerGhost,
          )}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="space-y-6">
        <FilterSection
          title="Filtrado por Isapre"
          description="Selecciona una o más Isapres para acotar los resultados."
        >
          <FilterCheckboxList
            options={ISAPRE_FILTER_OPTIONS}
            state={value.isapres}
            idPrefix="filter-isapre"
            onToggle={(optionId, checked) =>
              update({
                isapres: toggleCheckboxFilter(value.isapres, optionId, checked),
              })
            }
          />
        </FilterSection>

        <FilterSection
          title="Filtrado por Zona"
          description="Cobertura geográfica y comunas de prestación."
        >
          <FilterCheckboxList
            options={ZONE_FILTER_OPTIONS}
            state={value.zones}
            idPrefix="filter-zone"
            scrollable
            onToggle={(optionId, checked) =>
              update({
                zones: toggleCheckboxFilter(value.zones, optionId, checked),
              })
            }
          />
        </FilterSection>

        <FilterSection
          title="Filtrado por Tipo de Plan"
          description="Modalidad de contratación del plan de salud."
        >
          <FilterCheckboxList
            options={PLAN_TYPE_FILTER_OPTIONS}
            state={value.planTypes}
            idPrefix="filter-plan-type"
            onToggle={(optionId, checked) =>
              update({
                planTypes: toggleCheckboxFilter(
                  value.planTypes,
                  optionId,
                  checked,
                ),
              })
            }
          />
        </FilterSection>

        <FilterSection
          title="Filtrado por Cobertura"
          description="Umbral mínimo de cobertura hospitalaria y ambulatoria."
        >
          <div className="space-y-6">
            <CoveragePercentageFilter
              title="Cobertura hospitalaria"
              value={value.hospitalCoveragePercent}
              tone="hospital"
              onChange={(hospitalCoveragePercent) =>
                update({ hospitalCoveragePercent })
              }
            />

            <div className="border-t border-border pt-6">
              <CoveragePercentageFilter
                title="Cobertura ambulatoria"
                value={value.ambulatoryCoveragePercent}
                tone="ambulatory"
                onChange={(ambulatoryCoveragePercent) =>
                  update({ ambulatoryCoveragePercent })
                }
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
