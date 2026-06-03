export type BeneficiaryRole = "contributor" | "dependent";

export interface DependentBeneficiary {
  id: string;
  age: number | null;
}

export interface FamilyBeneficiariesState {
  contributorAge: number | null;
  dependents: DependentBeneficiary[];
}

export interface PersonRiskFactor {
  id: string;
  role: BeneficiaryRole;
  age: number | null;
  /** Tabla 604 lookup (informational). */
  tableFactor: number | null;
  /** Billable factor for pricing (0 if age ≤ 2 per Circular N°343). */
  factor: number | null;
  isRiskFactorExempt: boolean;
}

export interface BeneficiaryGroupSummary {
  contributor: PersonRiskFactor;
  dependents: PersonRiskFactor[];
  /** Cotizante + cargas with a valid age (used for GES headcount). */
  beneficiaryCount: number;
  /** @deprecated Use beneficiaryCount — kept for backward compatibility. */
  personCount: number;
  /** Sum of billable factors (excludes ages ≤ 2). */
  totalFactors: number;
}
