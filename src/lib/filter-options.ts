import type {
  CoveragePercentageOption,
  DashboardFiltersState,
  FilterOption,
  PlanTypeFilterId,
} from "@/types/filters";

export const ISAPRE_FILTER_OPTIONS: FilterOption[] = [
  { id: "consalud", label: "Consalud" },
  { id: "banmedica", label: "Banmédica" },
  { id: "colmena", label: "Colmena" },
  { id: "cruz-blanca", label: "Cruz Blanca" },
  { id: "vida-tres", label: "Vida Tres" },
  { id: "nueva-masvida", label: "Nueva Masvida" },
  { id: "esencial", label: "Esencial" },
];

export const ZONE_FILTER_OPTIONS: FilterOption[] = [
  { id: "rm-metropolitana", label: "Región Metropolitana" },
  { id: "rm-norte", label: "RM Norte" },
  { id: "rm-sur", label: "RM Sur" },
  { id: "rm-oriente", label: "RM Oriente" },
  { id: "rm-poniente", label: "RM Poniente" },
  { id: "rm-centro", label: "RM Centro" },
  { id: "norte", label: "Zona Norte" },
  { id: "octava", label: "Octava Región" },
  { id: "valparaiso", label: "Valparaíso" },
  { id: "biobio", label: "Biobío" },
];

export const PLAN_TYPE_FILTER_OPTIONS: {
  id: PlanTypeFilterId;
  label: string;
}[] = [
  { id: "closed", label: "Cerrado" },
  { id: "free_choice", label: "Libre Elección" },
  { id: "preferred", label: "Preferente" },
];

export const PLAN_TYPE_FILTER_DEFAULT_IDS = PLAN_TYPE_FILTER_OPTIONS.map(
  (option) => option.id,
);

export const COVERAGE_PERCENTAGE_OPTIONS: CoveragePercentageOption[] = [
  40, 50, 60, 70, 80, 100,
];

const ISAPRE_NAME_BY_ID: Record<string, string> = {
  consalud: "Consalud",
  banmedica: "Banmédica",
  colmena: "Colmena",
  "cruz-blanca": "Cruz Blanca",
  "vida-tres": "Vida Tres",
  "nueva-masvida": "Nueva Masvida",
  esencial: "Esencial",
};

export function resolveIsapreDisplayName(optionId: string): string {
  return ISAPRE_NAME_BY_ID[optionId] ?? optionId;
}

function buildCheckboxDefaults(
  options: FilterOption[],
  selectedIds: string[] = [],
): Record<string, boolean> {
  const selected = new Set(selectedIds);
  return Object.fromEntries(
    options.map((option) => [option.id, selected.has(option.id)]),
  );
}

export function createDefaultDashboardFilters(): DashboardFiltersState {
  return {
    isapres: buildCheckboxDefaults(ISAPRE_FILTER_OPTIONS, ["consalud"]),
    zones: buildCheckboxDefaults(ZONE_FILTER_OPTIONS, [
      "rm-metropolitana",
      "rm-oriente",
      "rm-centro",
    ]),
    planTypes: buildCheckboxDefaults(
      PLAN_TYPE_FILTER_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
      PLAN_TYPE_FILTER_DEFAULT_IDS,
    ),
    clinicId: null,
    hospitalCoveragePercent: null,
    ambulatoryCoveragePercent: null,
  };
}

/** Sin restricciones: ningún checkbox activo → se muestran todos los planes por cada eje. */
export function createClearedDashboardFilters(): DashboardFiltersState {
  return {
    isapres: buildCheckboxDefaults(ISAPRE_FILTER_OPTIONS),
    zones: buildCheckboxDefaults(ZONE_FILTER_OPTIONS),
    planTypes: buildCheckboxDefaults(
      PLAN_TYPE_FILTER_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
    ),
    clinicId: null,
    hospitalCoveragePercent: null,
    ambulatoryCoveragePercent: null,
  };
}

/** Widget embebido: sin filtro por porcentaje de cobertura. */
export function withoutCoverageFilters(
  filters: DashboardFiltersState,
): DashboardFiltersState {
  return {
    ...filters,
    hospitalCoveragePercent: null,
    ambulatoryCoveragePercent: null,
  };
}

/** Widget embebido: sin filtro por tipo de plan (cerrado, libre elección, preferente). */
export function withoutPlanTypeFilters(
  filters: DashboardFiltersState,
): DashboardFiltersState {
  return {
    ...filters,
    planTypes: buildCheckboxDefaults(
      PLAN_TYPE_FILTER_OPTIONS.map((o) => ({ id: o.id, label: o.label })),
    ),
  };
}

/** Quita filtro por clínica (widget embebido). */
export function withoutClinicFilter(
  filters: DashboardFiltersState,
): DashboardFiltersState {
  return {
    ...filters,
    clinicId: null,
  };
}

/** Widget embebido: quita filtros no disponibles en el iframe. */
export function withoutEmbedWidgetFilters(
  filters: DashboardFiltersState,
): DashboardFiltersState {
  return withoutClinicFilter(
    withoutPlanTypeFilters(withoutCoverageFilters(filters)),
  );
}

export function getActiveCheckboxIds(state: Record<string, boolean>): string[] {
  return Object.entries(state)
    .filter(([, active]) => active)
    .map(([id]) => id);
}

export function isCheckboxGroupActive(state: Record<string, boolean>): boolean {
  return getActiveCheckboxIds(state).length > 0;
}

export function toggleCheckboxFilter(
  state: Record<string, boolean>,
  optionId: string,
  checked: boolean,
): Record<string, boolean> {
  return { ...state, [optionId]: checked };
}
