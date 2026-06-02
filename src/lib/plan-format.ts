import type { CoverageEntry } from "@/types/plan";

const DEFAULT_UF_TO_CLP = 38_500;

export function formatPlanUf(value: number): string {
  return `${value.toLocaleString("es-CL", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} UF`;
}

export function formatPlanClp(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function planPriceClp(basePriceUf: number, ufToClp = DEFAULT_UF_TO_CLP): number {
  return basePriceUf * ufToClp;
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
