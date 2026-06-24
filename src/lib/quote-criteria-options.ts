export const REGION_OPTIONS = [
  { value: "rm", label: "Región Metropolitana" },
  { value: "arica", label: "Arica y Parinacota" },
  { value: "tarapaca", label: "Tarapacá" },
  { value: "antofagasta", label: "Antofagasta" },
  { value: "atacama", label: "Atacama" },
  { value: "coquimbo", label: "Coquimbo" },
  { value: "valparaiso", label: "Valparaíso" },
  { value: "ohiggins", label: "O'Higgins" },
  { value: "maule", label: "Maule" },
  { value: "nuble", label: "Ñuble" },
  { value: "biobio", label: "Biobío" },
  { value: "araucania", label: "La Araucanía" },
  { value: "los_rios", label: "Los Ríos" },
  { value: "los_lagos", label: "Los Lagos" },
  { value: "aysen", label: "Aysén" },
  { value: "magallanes", label: "Magallanes" },
] as const;

export const SEX_OPTIONS = [
  { value: "f", label: "Femenino" },
  { value: "m", label: "Masculino" },
] as const;

export type QuoteSortKey = "price_asc" | "price_desc" | "coverage";

export const SORT_OPTIONS: { value: QuoteSortKey; label: string }[] = [
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "coverage", label: "Mejor cobertura" },
];

export interface QuoteCriteria {
  region: string;
  monthlyIncome: string;
  /** Solo compatibilidad con deep links antiguos; ya no se solicita en la UI. */
  sex?: string;
}

export function createDefaultQuoteCriteria(): QuoteCriteria {
  return {
    region: "rm",
    monthlyIncome: "",
    sex: "",
  };
}
