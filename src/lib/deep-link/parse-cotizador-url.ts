import type { QuoteCriteria } from "@/components/cotizador/public/public-quote-criteria-bar";
import type { CurrencyDisplay } from "@/components/cotizador/public/public-results-toolbar";
import { buildBeneficiaryGroupSummary } from "@/domain";
import {
  COVERAGE_PERCENTAGE_OPTIONS,
  createDefaultDashboardFilters,
  ISAPRE_FILTER_OPTIONS,
  PLAN_TYPE_FILTER_OPTIONS,
  ZONE_FILTER_OPTIONS,
} from "@/lib/filter-options";
import { formatMonthlyIncomeForDisplay } from "@/lib/deep-link/income";
import {
  DEEP_LINK_PARAMS,
  VALID_CURRENCY,
  VALID_REGIONS,
  VALID_SEX_VALUES,
  VALID_SORT_KEYS,
} from "@/lib/deep-link/params";
import type { QuoteSortKey } from "@/lib/quote-criteria-options";
import type {
  BeneficiaryGroupSummary,
  DependentBeneficiary,
  FamilyBeneficiariesState,
} from "@/types/beneficiary";
import type {
  CoveragePercentageOption,
  DashboardFiltersState,
} from "@/types/filters";

export interface ParsedCotizadorDeepLink {
  entidad?: string;
  criteria: QuoteCriteria;
  beneficiaries: FamilyBeneficiariesState;
  beneficiarySummary: BeneficiaryGroupSummary;
  filters: DashboardFiltersState;
  priceMin?: number;
  priceMax?: number;
  q?: string;
  sortKey?: QuoteSortKey;
  currency?: CurrencyDisplay;
  /** Si false, solo prellena el formulario sin buscar al cargar. */
  shouldAutoSearch: boolean;
  /** true cuando la URL trae al menos un param de cotización/filtro. */
  hasDeepLinkParams: boolean;
  /** Correo del cotizante (desde cotizaloantes.cl u otro origen). */
  email?: string;
}

function parseCommaList(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function applyCheckboxSelection(
  options: { id: string }[],
  defaults: Record<string, boolean>,
  selectedIds: string[],
): Record<string, boolean> {
  if (selectedIds.length === 0) return defaults;

  const allowed = new Set(options.map((option) => option.id));
  const selected = new Set(selectedIds.filter((id) => allowed.has(id)));

  return Object.fromEntries(
    options.map((option) => [option.id, selected.has(option.id)]),
  );
}

function parseCoveragePercent(
  raw: string | null,
): CoveragePercentageOption | null {
  if (!raw?.trim()) return null;
  const value = Number(raw);
  return COVERAGE_PERCENTAGE_OPTIONS.includes(value as CoveragePercentageOption)
    ? (value as CoveragePercentageOption)
    : null;
}

function parseDependents(raw: string | null): DependentBeneficiary[] {
  if (!raw?.trim()) return [];

  const dependents: DependentBeneficiary[] = [];

  raw.split(",").forEach((item, index) => {
    const age = Number(item.trim());
    if (!Number.isFinite(age) || age < 0 || age > 120) return;
    dependents.push({ id: `dep-${index}`, age: Math.round(age) });
  });

  return dependents;
}

function parseContributorAge(raw: string | null): number | null {
  if (!raw?.trim()) return null;
  const age = Number(raw);
  if (!Number.isFinite(age) || age < 0 || age > 120) return null;
  return Math.round(age);
}

function parsePrice(raw: string | null): number | undefined {
  if (!raw?.trim()) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function parseEmail(raw: string | null): string | undefined {
  const value = raw?.trim().toLowerCase();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return undefined;
  return value;
}

function hasDeepLinkFilterParams(params: URLSearchParams): boolean {
  const keys = [
    DEEP_LINK_PARAMS.region,
    DEEP_LINK_PARAMS.edad,
    DEEP_LINK_PARAMS.sexo,
    DEEP_LINK_PARAMS.ingreso,
    DEEP_LINK_PARAMS.cargas,
    DEEP_LINK_PARAMS.q,
    DEEP_LINK_PARAMS.precioMin,
    DEEP_LINK_PARAMS.precioMax,
    DEEP_LINK_PARAMS.isapres,
    DEEP_LINK_PARAMS.zonas,
    DEEP_LINK_PARAMS.tipoPlan,
    DEEP_LINK_PARAMS.coberturaH,
    DEEP_LINK_PARAMS.coberturaA,
    DEEP_LINK_PARAMS.orden,
    DEEP_LINK_PARAMS.moneda,
    DEEP_LINK_PARAMS.email,
  ];

  return keys.some((key) => params.has(key));
}

function resolveShouldAutoSearch(params: URLSearchParams): boolean {
  const auto = params.get(DEEP_LINK_PARAMS.auto)?.trim();
  if (auto === "0") return false;
  if (auto === "1") return true;
  return true;
}

export function parseCotizadorUrl(
  params: URLSearchParams,
): ParsedCotizadorDeepLink {
  const defaults = createDefaultDashboardFilters();
  const isapreIds = parseCommaList(params.get(DEEP_LINK_PARAMS.isapres));
  const zoneIds = parseCommaList(params.get(DEEP_LINK_PARAMS.zonas));
  const planTypeIds = parseCommaList(params.get(DEEP_LINK_PARAMS.tipoPlan));

  const regionRaw = params.get(DEEP_LINK_PARAMS.region)?.trim().toLowerCase();
  const sexRaw = params.get(DEEP_LINK_PARAMS.sexo)?.trim().toLowerCase();
  const sortRaw = params.get(DEEP_LINK_PARAMS.orden)?.trim().toLowerCase();
  const currencyRaw = params.get(DEEP_LINK_PARAMS.moneda)?.trim().toLowerCase();

  const beneficiaries: FamilyBeneficiariesState = {
    contributorAge: parseContributorAge(params.get(DEEP_LINK_PARAMS.edad)),
    dependents: parseDependents(params.get(DEEP_LINK_PARAMS.cargas)),
  };

  const criteria: QuoteCriteria = {
    region: regionRaw && VALID_REGIONS.has(regionRaw) ? regionRaw : "rm",
    monthlyIncome: formatMonthlyIncomeForDisplay(
      params.get(DEEP_LINK_PARAMS.ingreso),
    ),
    sex: sexRaw && VALID_SEX_VALUES.has(sexRaw) ? sexRaw : "",
  };

  const filters: DashboardFiltersState = {
    isapres: applyCheckboxSelection(
      ISAPRE_FILTER_OPTIONS,
      defaults.isapres,
      isapreIds,
    ),
    zones: applyCheckboxSelection(
      ZONE_FILTER_OPTIONS,
      defaults.zones,
      zoneIds,
    ),
    planTypes: applyCheckboxSelection(
      PLAN_TYPE_FILTER_OPTIONS,
      defaults.planTypes,
      planTypeIds,
    ),
    hospitalCoveragePercent: parseCoveragePercent(
      params.get(DEEP_LINK_PARAMS.coberturaH),
    ),
    ambulatoryCoveragePercent: parseCoveragePercent(
      params.get(DEEP_LINK_PARAMS.coberturaA),
    ),
  };

  const entidad = params.get(DEEP_LINK_PARAMS.entidad)?.trim().toLowerCase();

  return {
    entidad: entidad || undefined,
    criteria,
    beneficiaries,
    beneficiarySummary: buildBeneficiaryGroupSummary(beneficiaries),
    filters,
    priceMin: parsePrice(params.get(DEEP_LINK_PARAMS.precioMin)),
    priceMax: parsePrice(params.get(DEEP_LINK_PARAMS.precioMax)),
    q: params.get(DEEP_LINK_PARAMS.q)?.trim() || undefined,
    sortKey:
      sortRaw && VALID_SORT_KEYS.has(sortRaw)
        ? (sortRaw as QuoteSortKey)
        : undefined,
    currency:
      currencyRaw && VALID_CURRENCY.has(currencyRaw)
        ? (currencyRaw as CurrencyDisplay)
        : undefined,
    shouldAutoSearch: resolveShouldAutoSearch(params),
    hasDeepLinkParams: hasDeepLinkFilterParams(params),
    email: parseEmail(params.get(DEEP_LINK_PARAMS.email)),
  };
}
