"use client";

import {
  createClearedDashboardFilters,
  getActiveClinicIds,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  toggleCheckboxFilter,
  ZONE_FILTER_OPTIONS,
} from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PlanCatalogClinicOption } from "@/lib/api/plan-clinics";
import type { DashboardFiltersState } from "@/domain";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { ClinicFilterSelect } from "./clinic-filter-select";
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
  /** Muestra buscador de clínica (cotizador principal y ejecutivos). */
  showClinicFilter?: boolean;
  clinicOptions?: PlanCatalogClinicOption[];
  clinicOptionsLoading?: boolean;
  clinicOptionsError?: string | null;
  /** Vista compacta para widget embebido en móvil. */
  compactEmbed?: boolean;
}

export function DashboardFiltersPanel({
  value,
  onChange,
  className,
  hideCoverageFilter = false,
  hidePlanTypeFilter = false,
  showClinicFilter = false,
  clinicOptions = [],
  clinicOptionsLoading = false,
  clinicOptionsError = null,
  compactEmbed = false,
}: DashboardFiltersPanelProps) {
  function update(partial: Partial<DashboardFiltersState>) {
    onChange({ ...value, ...partial });
  }

  function clearFilters() {
    onChange(createClearedDashboardFilters());
  }

  return (
    <div className={className}>
      <div className={joinClasses("mb-4 flex justify-end", compactEmbed && "max-md:mb-2")}>
        <button
          type="button"
          onClick={clearFilters}
          className={joinClasses(
            "inline-flex items-center gap-1.5 rounded-lg px-4 text-xs font-semibold",
            compactEmbed && "max-md:px-2.5 max-md:text-[11px]",
            touchTarget,
            ui.dangerGhost,
          )}
        >
          Limpiar filtros
        </button>
      </div>

      <div className={joinClasses("space-y-6", compactEmbed && "max-md:space-y-3")}>
        <FilterSection
          title="Filtrado por Isapre"
          description="Selecciona una o más Isapres para acotar los resultados."
          compactEmbed={compactEmbed}
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
            compactEmbed={compactEmbed}
            onToggle={(optionId, checked) =>
              update({
                isapres: toggleCheckboxFilter(value.isapres, optionId, checked),
              })
            }
          />
        </FilterSection>

        <FilterSection
          title="Filtrado por Zona"
          description="Se sincroniza con la región del buscador. También puedes ajustar sectores RM, norte, Valparaíso, etc."
          compactEmbed={compactEmbed}
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
            compactEmbed={compactEmbed}
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
          description="Clínicas opcionales y umbral mínimo de cobertura hospitalaria y ambulatoria."
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
          <div className="space-y-4">
            {showClinicFilter ? (
              <div className="space-y-2">
                <p
                  className={joinClasses(
                    "text-xs font-semibold text-primary-dark/80",
                    compactEmbed && "max-md:text-[11px]",
                  )}
                >
                  Prestador / clínica (opcional, una o más)
                </p>
                <ClinicFilterSelect
                  value={value.clinicIds}
                  onChange={(clinicIds) => update({ clinicIds })}
                  options={clinicOptions}
                  loading={clinicOptionsLoading}
                  error={clinicOptionsError}
                  modalTitle="Seleccionar prestador"
                  compactEmbed={compactEmbed}
                  showSelectedHint
                />
              </div>
            ) : null}

            <CoveragePercentageFilter
              title="Cobertura hospitalaria"
              value={value.hospitalCoveragePercent}
              tone="hospital"
              compactEmbed={compactEmbed}
              onChange={(hospitalCoveragePercent) =>
                update({ hospitalCoveragePercent })
              }
            />

            <CoveragePercentageFilter
              title="Cobertura ambulatoria"
              value={value.ambulatoryCoveragePercent}
              tone="ambulatory"
              compactEmbed={compactEmbed}
              onChange={(ambulatoryCoveragePercent) =>
                update({ ambulatoryCoveragePercent })
              }
            />

            {showClinicFilter && getActiveClinicIds(value).length > 0 ? (
              <p
                className={joinClasses(
                  "text-[11px] leading-snug text-muted",
                  compactEmbed && "max-md:text-[10px]",
                )}
              >
                Si eliges un porcentaje junto con clínicas, el plan debe
                cumplir ese mínimo en al menos una de las clínicas seleccionadas
                (hospitalaria y/o ambulatoria según corresponda).
              </p>
            ) : null}
          </div>
        </FilterSection>
        )}
      </div>
    </div>
  );
}
