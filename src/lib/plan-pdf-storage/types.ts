export interface PlanPdfUploadResult {
  url: string;
  storagePath: string;
  bytes: number;
  uploadedAt: string;
}

export interface UploadPlanPdfInput {
  fileBuffer: Buffer;
  isapre: string;
  uniqueCode: string;
  mimeType?: string;
  previousStoragePath?: string | null;
}

export interface UploadPlanPdfRequest {
  isapre: string;
  uniqueCode: string;
  previousStoragePath?: string | null;
}
