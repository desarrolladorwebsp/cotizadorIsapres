import type { CoverageEntry, HealthPlan } from "@/types/plan";

function isOptionalPdfField(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length > 0)
  );
}

function isValidCoverageEntry(entry: unknown): entry is CoverageEntry {
  if (!entry || typeof entry !== "object") return false;
  const coverage = entry as CoverageEntry;

  return (
    typeof coverage.clinic_id === "string" &&
    coverage.clinic_id.trim().length > 0 &&
    typeof coverage.clinic_name === "string" &&
    coverage.clinic_name.trim().length > 0 &&
    typeof coverage.percentage === "number" &&
    Number.isFinite(coverage.percentage) &&
    (coverage.type === "hospitalaria" || coverage.type === "ambulatoria")
  );
}

export function isValidPlan(payload: unknown): payload is HealthPlan {
  if (!payload || typeof payload !== "object") return false;
  const plan = payload as HealthPlan;

  return (
    typeof plan.isapre === "string" &&
    plan.isapre.trim().length > 0 &&
    typeof plan.plan_name === "string" &&
    plan.plan_name.trim().length > 0 &&
    typeof plan.unique_code === "string" &&
    plan.unique_code.trim().length > 0 &&
    typeof plan.base_price_uf === "number" &&
    Number.isFinite(plan.base_price_uf) &&
    plan.base_price_uf >= 0 &&
    typeof plan.has_top === "boolean" &&
    (plan.additional_notes === null ||
      typeof plan.additional_notes === "string") &&
    isOptionalPdfField(plan.pdf_url) &&
    isOptionalPdfField(plan.pdf_public_id) &&
    Array.isArray(plan.coverage) &&
    plan.coverage.every(isValidCoverageEntry)
  );
}

export function normalizePlan(payload: HealthPlan): HealthPlan {
  return {
    ...payload,
    isapre: payload.isapre.trim(),
    plan_name: payload.plan_name.trim(),
    unique_code: payload.unique_code.trim(),
    additional_notes: payload.additional_notes?.trim() || null,
    pdf_url: payload.pdf_url?.trim() || null,
    pdf_public_id: payload.pdf_public_id?.trim() || null,
    coverage: payload.coverage.map((entry) => ({
      clinic_id: entry.clinic_id.trim(),
      clinic_name: entry.clinic_name.trim(),
      percentage: entry.percentage,
      type: entry.type,
    })),
  };
}
