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
  factor: number | null;
}

export interface BeneficiaryGroupSummary {
  contributor: PersonRiskFactor;
  dependents: PersonRiskFactor[];
  personCount: number;
  totalFactors: number;
}
