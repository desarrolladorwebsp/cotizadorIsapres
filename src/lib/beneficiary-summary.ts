import {
  isRiskFactorExemptByAge,
} from "@/lib/isapre-pricing-rules";
import { getRiskFactor604, isValidBeneficiaryAge } from "@/lib/risk-factor-table-604";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
  PersonRiskFactor,
} from "@/types/beneficiary";

function resolveBillableFactor(
  age: number | null,
  role: PersonRiskFactor["role"],
): number | null {
  if (age === null || !isValidBeneficiaryAge(age)) return null;
  if (isRiskFactorExemptByAge(age)) return 0;

  return getRiskFactor604(age, role);
}

function isCountedBeneficiary(age: number | null): boolean {
  return age !== null && isValidBeneficiaryAge(age);
}

export function buildBeneficiaryGroupSummary(
  state: FamilyBeneficiariesState,
): BeneficiaryGroupSummary {
  const contributorTableFactor =
    state.contributorAge !== null
      ? getRiskFactor604(state.contributorAge, "contributor")
      : null;

  const contributor: PersonRiskFactor = {
    id: "contributor",
    role: "contributor",
    age: state.contributorAge,
    tableFactor: contributorTableFactor,
    factor: resolveBillableFactor(state.contributorAge, "contributor"),
    isRiskFactorExempt: isRiskFactorExemptByAge(state.contributorAge),
  };

  const dependents: PersonRiskFactor[] = state.dependents.map((dependent) => {
    const tableFactor =
      dependent.age !== null
        ? getRiskFactor604(dependent.age, "dependent")
        : null;

    return {
      id: dependent.id,
      role: "dependent",
      age: dependent.age,
      tableFactor,
      factor: resolveBillableFactor(dependent.age, "dependent"),
      isRiskFactorExempt: isRiskFactorExemptByAge(dependent.age),
    };
  });

  const allPersons = [contributor, ...dependents];

  const totalFactors = allPersons.reduce((sum, person) => {
    return sum + (person.factor ?? 0);
  }, 0);

  const beneficiaryCount = allPersons.filter((person) =>
    isCountedBeneficiary(person.age),
  ).length;

  return {
    contributor,
    dependents,
    beneficiaryCount,
    personCount: beneficiaryCount,
    totalFactors,
  };
}
