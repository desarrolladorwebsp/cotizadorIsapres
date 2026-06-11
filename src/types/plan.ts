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
  has_top: boolean;
  additional_notes: string | null;
  /** URL de descarga del PDF vía API local. */
  pdf_url: string | null;
  /** Ruta relativa en storage/planes-pdf (ej. consalud/13-sf1001-26.pdf). */
  pdf_public_id: string | null;
  coverage: CoverageEntry[];
}
