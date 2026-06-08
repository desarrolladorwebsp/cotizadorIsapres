export interface PlanPdfUploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  uploadedAt: string;
  folder: string;
}

export interface UploadPlanPdfInput {
  fileBuffer: Buffer;
  isapre: string;
  uniqueCode: string;
  mimeType?: string;
  previousPublicId?: string | null;
}

export interface UploadPlanPdfRequest {
  isapre: string;
  uniqueCode: string;
  previousPublicId?: string | null;
}
