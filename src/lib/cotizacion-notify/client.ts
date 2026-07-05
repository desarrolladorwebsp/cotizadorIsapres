import { buildCotizadorUrlFromParsed } from "@/lib/deep-link/build-cotizador-url";
import type { ParsedCotizadorDeepLink } from "@/lib/deep-link/parse-cotizador-url";
import type {
  CotizacionNotifyInput,
  CotizacionNotifyPlan,
  CotizacionNotifySolicitante,
} from "@/lib/email/cotizacion-notify-schema";
import {
  getActiveCheckboxIds,
  ISAPRE_FILTER_OPTIONS,
  resolveIsapreDisplayName,
} from "@/lib/filter-options";
import { formatPlanClp, formatPlanUf, formatQuotedUf } from "@/lib/plan-format";
import {
  PLAN_TYPE_LABELS,
  resolveCommercialPlanName,
  resolvePrimaryPlanType,
} from "@/lib/plan-metadata";
import { resolveAppBaseUrl } from "@/lib/platform/routing";
import {
  REGION_OPTIONS,
  SORT_OPTIONS,
  SEX_OPTIONS,
  type QuoteSortKey,
} from "@/lib/quote-criteria-options";
import type { QuoteCriteria } from "@/components/cotizador/public/public-quote-criteria-bar";
import type { CurrencyDisplay } from "@/components/cotizador/public/public-results-toolbar";
import type {
  BeneficiaryGroupSummary,
  HealthPlanSummary,
  PlanFinalPriceQuote,
} from "@/domain";
import type { DashboardFiltersState } from "@/types/filters";
import type { PartnerEntityTheme } from "@/types/partner-entity";

export interface BuildCotizacionNotifyPayloadInput {
  email: string;
  criteria: QuoteCriteria;
  beneficiarySummary: BeneficiaryGroupSummary;
  filters: DashboardFiltersState;
  searchText?: string;
  sortKey: QuoteSortKey;
  currency: CurrencyDisplay;
  deepLink?: ParsedCotizadorDeepLink;
  plan?: HealthPlanSummary;
  priceQuote?: PlanFinalPriceQuote;
  cotizadorUrl?: string;
  partnerEntitySlug?: string | null;
  partnerEntityName?: string | null;
  partnerEntityTheme?: PartnerEntityTheme | null;
  partnerEntityLogoUrl?: string | null;
  solicitante?: CotizacionNotifySolicitante;
}

function resolveRegionLabel(regionValue: string): string {
  return (
    REGION_OPTIONS.find((option) => option.value === regionValue)?.label ??
    regionValue
  );
}

function resolveSexLabel(sexValue: string): string {
  return (
    SEX_OPTIONS.find((option) => option.value === sexValue)?.label ?? sexValue
  );
}

function resolveSortLabel(sortKey: QuoteSortKey): string {
  return (
    SORT_OPTIONS.find((option) => option.value === sortKey)?.label ?? sortKey
  );
}

function resolveFilteredIsapres(
  filters: DashboardFiltersState,
): string[] | undefined {
  const activeIds = getActiveCheckboxIds(filters.isapres);
  if (activeIds.length === ISAPRE_FILTER_OPTIONS.length) return undefined;
  if (activeIds.length === 0) return undefined;
  return activeIds.map((id) => resolveIsapreDisplayName(id));
}

function resolveCotizadorUrl(
  deepLink: ParsedCotizadorDeepLink | undefined,
  explicitUrl?: string,
): string {
  if (explicitUrl?.trim()) return explicitUrl.trim();
  if (typeof window !== "undefined") return window.location.href;

  if (deepLink) {
    return buildCotizadorUrlFromParsed(deepLink);
  }

  return `${resolveAppBaseUrl()}/cotizador`;
}

function resolveAbsoluteLogoUrl(path: string | null | undefined): string | undefined {
  if (!path?.trim()) return undefined;
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = resolveAppBaseUrl().replace(/\/$/, "");
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

function buildPlanPayload(
  plan: HealthPlanSummary,
  priceQuote: PlanFinalPriceQuote,
  beneficiarySummary: BeneficiaryGroupSummary,
): CotizacionNotifyPlan {
  const planType = resolvePrimaryPlanType(plan);

  return {
    codigo: plan.unique_code,
    id: plan.unique_code.toLowerCase(),
    nombre: resolveCommercialPlanName(plan),
    isapre: plan.isapre,
    tipoPlan: PLAN_TYPE_LABELS[planType],
    precioUf: formatQuotedUf(priceQuote.finalPriceUf),
    precioClp: formatPlanClp(priceQuote.finalPriceClp),
    precioBaseUf: formatPlanUf(plan.base_price_uf),
    gesPremiumUf: formatPlanUf(plan.ges_premium_uf),
    tieneTop: plan.has_top,
    coberturaHospitalaria: plan.coverage_summary.hospital_avg,
    coberturaAmbulatoria: plan.coverage_summary.ambulatory_avg,
    clinicas: plan.coverage_summary.clinic_count,
    notas: plan.additional_notes?.trim() || undefined,
    pdfUrl: resolveAbsoluteLogoUrl(plan.pdf_url),
    totalBeneficiarios: beneficiarySummary.beneficiaryCount,
    factoresRiesgo: beneficiarySummary.totalFactors,
  };
}

export function buildCotizacionNotifyPayload(
  input: BuildCotizacionNotifyPayloadInput,
): CotizacionNotifyInput {
  const cargas = input.beneficiarySummary.dependents
    .map((dependent) => dependent.age)
    .filter((age): age is number => age !== null);

  const payload: CotizacionNotifyInput = {
    email: input.email.trim(),
    region: resolveRegionLabel(input.criteria.region),
    edad: input.beneficiarySummary.contributor.age ?? 0,
    sexo: resolveSexLabel(input.criteria.sex ?? "") || "No indicado",
    ingreso: input.criteria.monthlyIncome.trim() || undefined,
    cargas: cargas.length > 0 ? cargas : undefined,
    busqueda: input.searchText?.trim() || undefined,
    orden: resolveSortLabel(input.sortKey),
    moneda: input.currency,
    isapres: resolveFilteredIsapres(input.filters),
    cotizadorUrl: resolveCotizadorUrl(input.deepLink, input.cotizadorUrl),
    partnerEntitySlug:
      input.partnerEntitySlug?.trim().toLowerCase() || undefined,
    partnerEntityName: input.partnerEntityName?.trim() || undefined,
    partnerEntityTheme: input.partnerEntityTheme ?? undefined,
    partnerEntityLogoUrl: resolveAbsoluteLogoUrl(input.partnerEntityLogoUrl),
    solicitante: input.solicitante,
  };

  if (input.plan && input.priceQuote) {
    payload.plan = buildPlanPayload(
      input.plan,
      input.priceQuote,
      input.beneficiarySummary,
    );
  }

  return payload;
}

export async function postCotizacionNotify(
  payload: CotizacionNotifyInput,
): Promise<void> {
  const response = await fetch("/api/cotizacion-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "No se pudieron enviar los correos.");
  }
}

export async function notifyCotizacionByEmail(
  input: BuildCotizacionNotifyPayloadInput,
): Promise<void> {
  if (!input.email.trim()) return;
  await postCotizacionNotify(buildCotizacionNotifyPayload(input));
}
