import type { CoverageEntry } from "@/types/plan";

const DEFAULT_UF_TO_CLP = 38_500;

export function formatPlanUf(value: number): string {
  return `${value.toLocaleString("es-CL", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} UF`;
}

/** Final quoted price — UF prefix first (e.g. "UF 9,142"). */
export function formatQuotedUf(value: number): string {
  return `UF ${value.toLocaleString("es-CL", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}`;
}

export function formatPlanClp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** @deprecated Use calculateFinalPlanPriceClp from plan-final-price for quoted prices. */
export function planPriceClp(basePriceUf: number, ufToClp = DEFAULT_UF_TO_CLP): number {
  return Math.round(basePriceUf * ufToClp);
}

export function splitCoverageByType(coverage: CoverageEntry[]) {
  return {
    hospitalaria: coverage.filter((entry) => entry.type === "hospitalaria"),
    ambulatoria: coverage.filter((entry) => entry.type === "ambulatoria"),
  };
}

export function coverageGlobalPercentage(entries: CoverageEntry[]): number {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + entry.percentage, 0);
  return Math.round(total / entries.length);
}

export { DEFAULT_UF_TO_CLP };
