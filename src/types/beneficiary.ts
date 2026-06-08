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
  tableFactor: number | null;
  factor: number | null;
  isRiskFactorExempt: boolean;
}

export interface BeneficiaryGroupSummary {
  contributor: PersonRiskFactor;
  dependents: PersonRiskFactor[];
  beneficiaryCount: number;
  personCount: number;
  totalFactors: number;
}
