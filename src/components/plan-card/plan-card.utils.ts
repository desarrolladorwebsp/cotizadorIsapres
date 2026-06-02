import type { HealthPlan } from "@/types/plan";

export const VISIBLE_CLINICS_LIMIT = 6;

export function resolvePlanBadges(
  plan: HealthPlan,
  badges?: string[],
): string[] {
  if (badges && badges.length > 0) return badges;
  return plan.has_top ? ["Top"] : [];
}
