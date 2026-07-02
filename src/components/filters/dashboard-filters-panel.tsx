"use client";

import {
  createClearedDashboardFilters,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  toggleCheckboxFilter,
  ZONE_FILTER_OPTIONS,
} from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { DashboardFiltersState } from "@/domain";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { CoveragePercentageFilter } from "./coverage-percentage-filter";
import { FilterCheckboxList } from "./filter-checkbox-list";
import { FilterHelpBlock } from "./filter-info-tip";
import { FilterSection } from "./filter-section";

export interface DashboardFiltersPanelProps {
  value: DashboardFiltersState;
  onChange: (next: DashboardFiltersState) => void;
  className?: string;
  /** Oculta el bloque de cobertura hospitalaria/ambulatoria (widget embebido). */
  hideCoverageFilter?: boolean;
  /** Oculta el bloque de tipo de plan (widget embebido). */
  hidePlanTypeFilter?: boolean;
}

export function DashboardFiltersPanel({
  value,
  onChange,
  className,
  hideCoverageFilter = false,
  hidePlanTypeFilter = false,
}: DashboardFiltersPanelProps) {
  function update(partial: Partial<DashboardFiltersState>) {
    onChange({ ...value, ...partial });
  }

  function clearFilters() {
    onChange(createClearedDashboardFilters());
  }

  return (
    <div className={className}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
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
          infoLabel="Información sobre Isapres"
          info={
            <FilterHelpBlock
              title={FILTER_HELP.isapre.title}
              paragraphs={FILTER_HELP.isapre.body}
              source={FILTER_HELP.isapre.source}
            />
          }
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
          description="Muestra planes con prestadores en las zonas seleccionadas (sector RM, norte, Valparaíso, etc.)."
          infoLabel="Información sobre zonas y sectores geográficos"
          info={
            <FilterHelpBlock
              title={FILTER_HELP.zone.title}
              paragraphs={FILTER_HELP.zone.paragraphs}
              items={FILTER_HELP.zone.items}
              footnote={FILTER_HELP.zone.footnote}
              source={FILTER_HELP.zone.source}
            />
          }
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

        {hidePlanTypeFilter ? null : (
        <FilterSection
          title="Filtrado por Tipo de Plan"
          description="Modalidad de contratación del plan de salud."
          infoLabel="Información sobre tipos de plan"
          info={
            <FilterHelpBlock
              title={FILTER_HELP.planType.title}
              paragraphs={FILTER_HELP.planType.paragraphs}
              items={FILTER_HELP.planType.items}
              footnote={FILTER_HELP.planType.footnote}
              source={FILTER_HELP.planType.source}
            />
          }
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
        )}

        {hideCoverageFilter ? null : (
        <FilterSection
          title="Filtrado por Cobertura"
          description="Umbral mínimo de cobertura hospitalaria y ambulatoria."
          infoLabel="Información sobre porcentajes de cobertura"
          info={
            <FilterHelpBlock
              title={FILTER_HELP.coverage.title}
              paragraphs={FILTER_HELP.coverage.body}
              items={FILTER_HELP.coverage.items}
              source={FILTER_HELP.coverage.source}
            />
          }
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
        )}
      </div>
    </div>
  );
}
