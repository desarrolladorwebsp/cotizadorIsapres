import { buildPlanPdfFolder, buildPlanPdfPublicPath } from "@/lib/cloudinary/build-plan-pdf-path";
import { configureCloudinary } from "@/lib/cloudinary/config";
import {
  PLAN_PDF_ALLOWED_MIME_TYPES,
  PLAN_PDF_MAX_BYTES,
} from "@/lib/cloudinary/constants";
import { deletePlanPdf } from "@/lib/cloudinary/delete-plan-pdf";
import { sanitizePlanPdfPublicId } from "@/lib/cloudinary/sanitize-public-id";
import type {
  PlanPdfUploadResult,
  UploadPlanPdfInput,
} from "@/lib/cloudinary/types";

function assertValidPdfUpload(
  fileBuffer: Buffer,
  mimeType: string | undefined,
): void {
  if (fileBuffer.byteLength === 0) {
    throw new Error("El archivo PDF está vacío.");
  }

  if (fileBuffer.byteLength > PLAN_PDF_MAX_BYTES) {
    throw new Error("El PDF supera el tamaño máximo permitido (15 MB).");
  }

  if (mimeType && !PLAN_PDF_ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("Solo se permiten archivos PDF.");
  }

  const header = fileBuffer.subarray(0, 4).toString("utf8");
  if (!header.startsWith("%PDF")) {
    throw new Error("El archivo no parece ser un PDF válido.");
  }
}

export async function uploadPlanPdf({
  fileBuffer,
  isapre,
  uniqueCode,
  mimeType,
  previousPublicId,
}: UploadPlanPdfInput): Promise<PlanPdfUploadResult> {
  const trimmedIsapre = isapre.trim();
  const trimmedCode = uniqueCode.trim();

  if (!trimmedIsapre) {
    throw new Error("La Isapre es obligatoria para almacenar el PDF.");
  }

  if (!trimmedCode) {
    throw new Error("El código único del plan es obligatorio para subir el PDF.");
  }

  assertValidPdfUpload(fileBuffer, mimeType);

  const folder = buildPlanPdfFolder(trimmedIsapre);
  const publicId = sanitizePlanPdfPublicId(trimmedCode);
  const targetPublicPath = buildPlanPdfPublicPath(trimmedIsapre, trimmedCode);
  const previous = previousPublicId?.trim() ?? "";

  if (previous && previous !== targetPublicPath) {
    try {
      await deletePlanPdf(previous);
    } catch (error) {
      console.warn("No se pudo eliminar el PDF anterior en Cloudinary:", error);
    }
  }

  const cloudinary = configureCloudinary();
  const dataUri = `data:application/pdf;base64,${fileBuffer.toString("base64")}`;

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    resource_type: "raw",
    folder,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
  });

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    bytes: uploadResult.bytes,
    format: uploadResult.format ?? "pdf",
    uploadedAt: new Date().toISOString(),
    folder,
  };
}
