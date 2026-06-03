export type PlanTypeFilterId = "closed" | "free_choice" | "preferred";

export type CoveragePercentageOption = 40 | 50 | 60 | 70 | 80 | 100;

export interface CheckboxFilterState {
  [optionId: string]: boolean;
}

export interface DashboardFiltersState {
  isapres: CheckboxFilterState;
  zones: CheckboxFilterState;
  planTypes: CheckboxFilterState;
  hospitalCoveragePercent: CoveragePercentageOption | null;
  ambulatoryCoveragePercent: CoveragePercentageOption | null;
}

export interface FilterOption {
  id: string;
  label: string;
}
