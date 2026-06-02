import { getRiskFactor604 } from "@/lib/risk-factor-table-604";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
  PersonRiskFactor,
} from "@/types/beneficiary";

export function buildBeneficiaryGroupSummary(
  state: FamilyBeneficiariesState,
): BeneficiaryGroupSummary {
  const contributorFactor =
    state.contributorAge !== null
      ? getRiskFactor604(state.contributorAge, "contributor")
      : null;

  const contributor: PersonRiskFactor = {
    id: "contributor",
    role: "contributor",
    age: state.contributorAge,
    factor: contributorFactor,
  };

  const dependents: PersonRiskFactor[] = state.dependents.map((dependent) => ({
    id: dependent.id,
    role: "dependent",
    age: dependent.age,
    factor:
      dependent.age !== null
        ? getRiskFactor604(dependent.age, "dependent")
        : null,
  }));

  const totalFactors = [contributor, ...dependents].reduce((sum, person) => {
    return sum + (person.factor ?? 0);
  }, 0);

  return {
    contributor,
    dependents,
    personCount: 1 + state.dependents.length,
    totalFactors,
  };
}
