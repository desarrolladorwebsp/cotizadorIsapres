/**
 * Chilean Isapre pricing rules (Superintendencia de Salud).
 * Tabla Única de Factores — Circular N°343 (under-2 exemption).
 */

/** GES (Garantías Explícitas en Salud) fixed premium per beneficiary, in UF/month. */
export const GES_PREMIUM_UF_PER_BENEFICIARY = 0.731;

/**
 * Ages ≤ this value are exempt from the group risk-factor sum (factor treated as 0).
 * Applies from birth through 1 year 11 months per official guidance (≤ 2 years).
 */
export const RISK_FACTOR_EXEMPT_MAX_AGE_YEARS = 2;

export function isRiskFactorExemptByAge(age: number | null): boolean {
  return age !== null && age <= RISK_FACTOR_EXEMPT_MAX_AGE_YEARS;
}
