export type { Clinic, ClinicInput } from "@/types/clinic";
export type {
  BeneficiaryGroupSummary,
  BeneficiaryRole,
  DependentBeneficiary,
  FamilyBeneficiariesState,
  PersonRiskFactor,
} from "@/types/beneficiary";
export type {
  CheckboxFilterState,
  CoveragePercentageOption,
  DashboardFiltersState,
  FilterOption,
  PlanTypeFilterId,
} from "@/types/filters";
export type {
  CoverageEntry,
  CoverageType,
  HealthPlan,
  HealthPlanSummary,
  PlanCoverageSummary,
  PlanSearchResult,
} from "@/types/plan";

export { buildBeneficiaryGroupSummary } from "@/lib/beneficiary-summary";
export {
  formatRiskFactor,
  getRiskFactor604,
  isValidBeneficiaryAge,
  parseBeneficiaryAge,
} from "@/lib/risk-factor-table-604";
export {
  calculateFinalPlanPriceClp,
  calculateFinalPlanPriceUf,
  buildPlanFinalPriceQuote,
  type PlanFinalPriceQuote,
} from "@/lib/plan-final-price";
export {
  buildSinglePersonPricesByAge,
  formatAgePriceClpShort,
  SINGLE_PERSON_AGE_SAMPLES,
  type AgePricePoint,
} from "@/lib/plan-price-by-age";
export { DEFAULT_UF_VALUE_CLP } from "@/lib/economic-indicators";
export type { UfIndicator } from "@/lib/uf-service";
export { buildFallbackUfIndicator, fetchUfIndicator } from "@/lib/uf-service";
export {
  GES_PREMIUM_UF_PER_BENEFICIARY,
  RISK_FACTOR_EXEMPT_MAX_AGE_YEARS,
  isRiskFactorExemptByAge,
} from "@/lib/isapre-pricing-rules";
export {
  coverageGlobalPercentage,
  formatCoveragePercentagesList,
  uniqueCoveragePercentages,
  formatPlanClp,
  formatPlanUf,
  formatQuotedUf,
  planPriceClp,
  splitCoverageByType,
} from "@/lib/plan-format";
export {
  PLAN_TYPE_LABELS,
  formatBasePriceBadgeLabel,
  inferPlanTypes,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
} from "@/lib/plan-metadata";
export { applyDashboardFilters } from "@/lib/apply-plan-filters";
export {
  COVERAGE_PERCENTAGE_OPTIONS,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  ZONE_FILTER_OPTIONS,
  createClearedDashboardFilters,
  createDefaultDashboardFilters,
  withoutCoverageFilters,
  withoutClinicFilter,
  withoutEmbedWidgetFilters,
  withoutPlanTypeFilters,
  PLAN_TYPE_FILTER_DEFAULT_IDS,
  getActiveCheckboxIds,
  isCheckboxGroupActive,
  resolveIsapreDisplayName,
  toggleCheckboxFilter,
} from "@/lib/filter-options";
export { slugifyClinicId } from "@/lib/slugify";
