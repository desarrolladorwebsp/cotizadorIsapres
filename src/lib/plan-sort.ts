import { buildPlanFinalPriceQuote } from "@/domain";
import type { BeneficiaryGroupSummary } from "@/types/beneficiary";
import type { HealthPlan, HealthPlanSummary } from "@/types/plan";

type PlanWithBasePrice = {
  base_price_uf: number;
  plan_name?: string;
  unique_code?: string;
};

type PlanWithFinalPrice = {
  base_price_uf: number;
  ges_premium_uf?: number;
  plan_name: string;
  unique_code: string;
};

function comparePlanNames(a: PlanWithBasePrice, b: PlanWithBasePrice): number {
  const nameA = a.plan_name ?? a.unique_code ?? "";
  const nameB = b.plan_name ?? b.unique_code ?? "";
  return nameA.localeCompare(nameB, "es");
}

export function comparePlansByBasePriceAsc(
  a: PlanWithBasePrice,
  b: PlanWithBasePrice,
): number {
  const diff = a.base_price_uf - b.base_price_uf;
  if (diff !== 0) return diff;
  return comparePlanNames(a, b);
}

export function sortPlansByBasePriceAsc<T extends PlanWithBasePrice>(
  plans: T[],
): T[] {
  return [...plans].sort(comparePlansByBasePriceAsc);
}

export function comparePlansByFinalPriceAsc(
  a: PlanWithFinalPrice,
  b: PlanWithFinalPrice,
  beneficiarySummary: BeneficiaryGroupSummary,
  ufToClp: number,
): number {
  const priceA = buildPlanFinalPriceQuote(
    a.base_price_uf,
    beneficiarySummary,
    ufToClp,
    a.ges_premium_uf,
  ).finalPriceUf;
  const priceB = buildPlanFinalPriceQuote(
    b.base_price_uf,
    beneficiarySummary,
    ufToClp,
    b.ges_premium_uf,
  ).finalPriceUf;
  const diff = priceA - priceB;
  if (Math.abs(diff) > 1e-9) return diff;
  const baseDiff = a.base_price_uf - b.base_price_uf;
  if (Math.abs(baseDiff) > 1e-9) return baseDiff;
  return comparePlanNames(a, b);
}

export function sortPlansByFinalPriceAsc<T extends PlanWithFinalPrice>(
  plans: T[],
  beneficiarySummary: BeneficiaryGroupSummary,
  ufToClp: number,
): T[] {
  return [...plans].sort((a, b) =>
    comparePlansByFinalPriceAsc(a, b, beneficiarySummary, ufToClp),
  );
}

/** Orden estable por precio final para catálogos completos del panel ejecutivo. */
export function sortHealthPlansByFinalPriceAsc(
  plans: HealthPlan[],
  beneficiarySummary: BeneficiaryGroupSummary,
  ufToClp: number,
): HealthPlan[] {
  return sortPlansByFinalPriceAsc(plans, beneficiarySummary, ufToClp);
}

export function sortHealthPlanSummariesByFinalPriceAsc(
  plans: HealthPlanSummary[],
  beneficiarySummary: BeneficiaryGroupSummary,
  ufToClp: number,
): HealthPlanSummary[] {
  return sortPlansByFinalPriceAsc(plans, beneficiarySummary, ufToClp);
}
