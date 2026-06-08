import { DEFAULT_UF_VALUE_CLP } from "@/lib/economic-indicators";
import { GES_PREMIUM_UF_PER_BENEFICIARY } from "@/lib/isapre-pricing-rules";
import type { BeneficiaryGroupSummary } from "@/types/beneficiary";

export interface PlanFinalPriceQuote {
  basePriceUf: number;
  groupTotalFactor: number;
  beneficiaryCount: number;
  gesPremiumUfPerPerson: number;
  gesTotalUf: number;
  riskComponentUf: number;
  finalPriceUf: number;
  finalPriceClp: number;
  ufToClp: number;
}

export function calculateFinalPlanPriceUf(
  basePriceUf: number,
  groupTotalFactor: number,
  beneficiaryCount: number,
  gesPremiumUfPerPerson: number = GES_PREMIUM_UF_PER_BENEFICIARY,
): number {
  return groupTotalFactor * basePriceUf + beneficiaryCount * gesPremiumUfPerPerson;
}

export function calculateFinalPlanPriceClp(
  finalPriceUf: number,
  ufToClp: number = DEFAULT_UF_VALUE_CLP,
): number {
  return Math.round(finalPriceUf * ufToClp);
}

export function buildPlanFinalPriceQuote(
  basePriceUf: number,
  summary: BeneficiaryGroupSummary,
  ufToClp: number = DEFAULT_UF_VALUE_CLP,
): PlanFinalPriceQuote {
  const groupTotalFactor = summary.totalFactors;
  const beneficiaryCount = summary.beneficiaryCount;
  const gesTotalUf = beneficiaryCount * GES_PREMIUM_UF_PER_BENEFICIARY;
  const riskComponentUf = groupTotalFactor * basePriceUf;
  const finalPriceUf = riskComponentUf + gesTotalUf;
  const finalPriceClp = calculateFinalPlanPriceClp(finalPriceUf, ufToClp);

  return {
    basePriceUf,
    groupTotalFactor,
    beneficiaryCount,
    gesPremiumUfPerPerson: GES_PREMIUM_UF_PER_BENEFICIARY,
    gesTotalUf,
    riskComponentUf,
    finalPriceUf,
    finalPriceClp,
    ufToClp,
  };
}
