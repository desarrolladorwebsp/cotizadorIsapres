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
  /** URL del PDF oficial del plan en Cloudinary. */
  pdf_url: string | null;
  /** Identificador público en Cloudinary para reemplazos o descargas. */
  pdf_public_id: string | null;
  coverage: CoverageEntry[];
}
