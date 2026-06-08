import type { PlanTypeFilterId } from "@/types/filters";
import type { HealthPlan } from "@/types/plan";

export const PLAN_TYPE_LABELS: Record<PlanTypeFilterId, string> = {
  closed: "Cerrado",
  free_choice: "Libre Elección",
  preferred: "Preferente",
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function inferPlanTypes(plan: HealthPlan): PlanTypeFilterId[] {
  const name = normalizeText(plan.plan_name);
  const notes = normalizeText(plan.additional_notes ?? "");
  const types: PlanTypeFilterId[] = [];

  if (plan.has_top || name.includes("preferente") || notes.includes("preferente")) {
    types.push("preferred");
  }
  if (
    name.includes("libre") ||
    notes.includes("libre eleccion") ||
    name.includes("le ")
  ) {
    types.push("free_choice");
  }
  if (
    name.includes("cerrado") ||
    name.includes("-sf") ||
    notes.includes("cerrado")
  ) {
    types.push("closed");
  }
  if (types.length === 0) types.push("free_choice");
  return types;
}

export function resolvePrimaryPlanType(plan: HealthPlan): PlanTypeFilterId {
  const types = inferPlanTypes(plan);
  if (types.includes("preferred")) return "preferred";
  if (types.includes("closed")) return "closed";
  return "free_choice";
}

export function resolveCommercialPlanName(plan: HealthPlan): string {
  const prefix = `${plan.isapre} `.trim();
  const normalizedPrefix = `${prefix} `;
  if (plan.plan_name.toLowerCase().startsWith(normalizedPrefix.toLowerCase())) {
    const stripped = plan.plan_name.slice(normalizedPrefix.length).trim();
    return stripped.length > 0 ? stripped : plan.plan_name;
  }
  return plan.plan_name;
}

export function formatBasePriceBadgeLabel(basePriceUf: number): string {
  return `BASE ${basePriceUf.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
