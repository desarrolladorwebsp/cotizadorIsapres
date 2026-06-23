export type CoverageType = "hospitalaria" | "ambulatoria";

export interface CoverageEntry {
  clinic_id: string;
  clinic_name: string;
  percentage: number;
  type: CoverageType;
}

export interface HealthPlan {
  isapre: string;
  plan_name: string;
  unique_code: string;
  base_price_uf: number;
  /** Prima GES mensual en UF por beneficiario (según isapre). */
  ges_premium_uf: number;
  has_top: boolean;
  additional_notes: string | null;
  /** URL de descarga del PDF vía API local. */
  pdf_url: string | null;
  /** Ruta relativa en storage/planes-pdf (ej. consalud/13-sf1001-26.pdf). */
  pdf_public_id: string | null;
  coverage: CoverageEntry[];
}

/** Resumen de coberturas para listados (sin detalle por clínica). */
export interface PlanCoverageSummary {
  clinic_count: number;
  hospital_percentages: number[];
  ambulatory_percentages: number[];
  hospital_avg: number;
  ambulatory_avg: number;
}

/** Plan ligero para resultados de búsqueda (sin array de coberturas completo). */
export interface HealthPlanSummary {
  isapre: string;
  plan_name: string;
  unique_code: string;
  base_price_uf: number;
  ges_premium_uf: number;
  has_top: boolean;
  additional_notes: string | null;
  pdf_url: string | null;
  pdf_public_id: string | null;
  coverage_summary: PlanCoverageSummary;
}

export interface PlanSearchResult {
  plans: HealthPlanSummary[];
  total: number;
  limit: number;
  offset: number;
}
