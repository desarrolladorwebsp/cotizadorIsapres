"use client";

import {
  createClearedDashboardFilters,
  getActiveClinicIds,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  toggleCheckboxFilter,
  ZONE_FILTER_OPTIONS,
} from "@/domain";
import { FILTER_HELP } from "@/lib/filter-help-content";
import { touchTarget } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PlanCatalogClinicOption } from "@/lib/api/plan-clinics";
import type { DashboardFiltersState } from "@/domain";
import { ClinicFilterSelect } from "./clinic-filter-select";
import { CoveragePercentageFilter } from "./coverage-percentage-filter";
import { FilterCheckboxList } from "./filter-checkbox-list";
import { FilterHelpBlock } from "./filter-info-tip";
import { FilterSection } from "./filter-section";
import { PriceFilterSection } from "./price-filter-section";

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
  priceMin?: number;
  priceMax?: number;
  ufToClp?: number;
  onPriceMinChange?: (value: number) => void;
  onPriceMaxChange?: (value: number) => void;
  defaultPriceMin?: number;
  defaultPriceMax?: number;
  /** Oculta textos de ayuda bajo cada bloque de filtro. */
  hideHelperText?: boolean;
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
  priceMin,
  priceMax,
  ufToClp = 1,
  onPriceMinChange,
  onPriceMaxChange,
  defaultPriceMin,
  defaultPriceMax,
  hideHelperText = false,
}: DashboardFiltersPanelProps) {
  const showPriceFilter =
    priceMin !== undefined &&
    priceMax !== undefined &&
    onPriceMinChange !== undefined &&
    onPriceMaxChange !== undefined;

  function update(partial: Partial<DashboardFiltersState>) {
    onChange({ ...value, ...partial });
  }

  function clearFilters() {
    onChange(createClearedDashboardFilters());

    if (
      showPriceFilter &&
      defaultPriceMin !== undefined &&
      defaultPriceMax !== undefined
    ) {
      onPriceMinChange(defaultPriceMin);
      onPriceMaxChange(defaultPriceMax);
    }
  }

  return (
    <div className={className}>
      <div
        className={joinClasses(
          "divide-y divide-border/50",
          compactEmbed && "max-md:divide-border/40",
        )}
      >
        {showClinicFilter ? (
          <FilterSection
            title="Clínica"
            description="Elige prestadores y, si lo deseas, un umbral mínimo de cobertura."
            compactEmbed={compactEmbed}
            hideDescription={hideHelperText}
            infoLabel="Información sobre filtro de clínicas"
            info={
              <FilterHelpBlock
                title="Prestadores y clínicas"
                paragraphs={[
                  "Filtra planes que incluyan al menos una de las clínicas o centros que selecciones.",
                  FILTER_HELP.coverage.body[1],
                ]}
                source={FILTER_HELP.coverage.source}
              />
            }
          >
            <div className="space-y-4">
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

              {hideCoverageFilter ? null : (
                <>
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

                  {getActiveClinicIds(value).length > 0 ? (
                    <p
                      className={joinClasses(
                        "text-[11px] leading-snug text-muted",
                        compactEmbed && "max-md:text-[10px]",
                      )}
                    >
                      Si eliges un porcentaje junto con clínicas, el plan debe
                      cumplir ese mínimo en al menos una de las clínicas
                      seleccionadas (hospitalaria y/o ambulatoria según
                      corresponda).
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </FilterSection>
        ) : null}

        <FilterSection
          title="Isapre"
          description="Selecciona una o más Isapres para acotar los resultados."
          compactEmbed={compactEmbed}
          hideDescription={hideHelperText}
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

        {hidePlanTypeFilter ? null : (
          <FilterSection
            title="Tipo de plan"
            description="Modalidad de contratación del plan de salud."
            compactEmbed={compactEmbed}
            hideDescription={hideHelperText}
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
              compactEmbed={compactEmbed}
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

        {showPriceFilter ? (
          <PriceFilterSection
            priceMin={priceMin}
            priceMax={priceMax}
            ufToClp={ufToClp}
            onPriceMinChange={onPriceMinChange}
            onPriceMaxChange={onPriceMaxChange}
            compactEmbed={compactEmbed}
            hideHelperText={hideHelperText}
          />
        ) : null}

        <FilterSection
          title="Zonas"
          description="Se sincroniza con la región del buscador. También puedes ajustar sectores RM, norte, Valparaíso, etc."
          compactEmbed={compactEmbed}
          hideDescription={hideHelperText}
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

        <div className={joinClasses("py-4", compactEmbed && "max-md:py-3")}>
          <button
            type="button"
            onClick={clearFilters}
            className={joinClasses(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-bg-layout/40 px-4 text-xs font-semibold text-muted transition hover:border-border hover:bg-surface-hover hover:text-foreground",
              compactEmbed && "max-md:px-2.5 max-md:text-[11px]",
              touchTarget,
            )}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
