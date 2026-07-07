import type { FamilyBeneficiariesState } from "@/types/beneficiary";

export function getConfirmedDependents(
  beneficiaries: FamilyBeneficiariesState,
) {
  return beneficiaries.dependents.filter(
    (dependent) => dependent.age !== null,
  );
}

export function formatBeneficiariesBarSummary(
  beneficiaries: FamilyBeneficiariesState,
): string | null {
  const parts: string[] = [];
  const confirmed = getConfirmedDependents(beneficiaries);

  if (beneficiaries.contributorAge !== null) {
    parts.push(`Cotizante ${beneficiaries.contributorAge} años`);
  }

  if (confirmed.length > 0) {
    const ages = confirmed.map((dependent) => `${dependent.age} años`).join(", ");
    parts.push(
      `${confirmed.length} carga${confirmed.length === 1 ? "" : "s"} (${ages})`,
    );
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatDependentsCountLabel(count: number): string {
  if (count === 0) return "Sin cargas";
  return `${count} carga${count === 1 ? "" : "s"}`;
}
