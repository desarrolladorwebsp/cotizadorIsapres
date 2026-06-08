export const GES_PREMIUM_UF_PER_BENEFICIARY = 0.731;
export const RISK_FACTOR_EXEMPT_MAX_AGE_YEARS = 2;

export function isRiskFactorExemptByAge(age: number | null): boolean {
  return age !== null && age <= RISK_FACTOR_EXEMPT_MAX_AGE_YEARS;
}
