import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ApiError } from "@/lib/api/api-error";
import {
  PLAN_PDF_ALLOWED_MIME_TYPES,
  PLAN_PDF_MAX_BYTES,
} from "@/lib/plan-pdf-storage/constants";
import { deletePlanPdfVariants } from "@/lib/plan-pdf-storage/delete";
import {
  buildPlanPdfApiUrl,
  buildPlanPdfStorageKey,
  collectPlanPdfCleanupKeys,
  resolveAbsolutePdfPath,
} from "@/lib/plan-pdf-storage/paths";
import type {
  PlanPdfUploadResult,
  UploadPlanPdfInput,
} from "@/lib/plan-pdf-storage/types";

function assertValidPdfUpload(
  fileBuffer: Buffer,
  mimeType: string | undefined,
): void {
  if (fileBuffer.byteLength === 0) {
    throw new ApiError("El archivo PDF está vacío.", 400);
  }

  if (fileBuffer.byteLength > PLAN_PDF_MAX_BYTES) {
    throw new ApiError("El PDF supera el tamaño máximo permitido (15 MB).", 400);
  }

  if (mimeType && !PLAN_PDF_ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ApiError("Solo se permiten archivos PDF.", 400);
  }

  const header = fileBuffer.subarray(0, 4).toString("utf8");
  if (!header.startsWith("%PDF")) {
    throw new ApiError("El archivo no parece ser un PDF válido.", 400);
  }
}

export async function savePlanPdf({
  fileBuffer,
  isapre,
  uniqueCode,
  mimeType,
  previousStoragePath,
}: UploadPlanPdfInput): Promise<PlanPdfUploadResult> {
  const trimmedIsapre = isapre.trim();
  const trimmedCode = uniqueCode.trim();

  if (!trimmedIsapre) {
    throw new ApiError("La Isapre es obligatoria para almacenar el PDF.", 400);
  }

  if (!trimmedCode) {
    throw new ApiError(
      "El código único del plan es obligatorio para subir el PDF.",
      400,
    );
  }

  assertValidPdfUpload(fileBuffer, mimeType);

  const storageKey = buildPlanPdfStorageKey(trimmedIsapre, trimmedCode);
  const absolutePath = resolveAbsolutePdfPath(storageKey);

  await deletePlanPdfVariants(
    collectPlanPdfCleanupKeys(trimmedIsapre, trimmedCode, previousStoragePath),
  );

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, fileBuffer);

  return {
    url: buildPlanPdfApiUrl(trimmedCode),
    storagePath: storageKey,
    bytes: fileBuffer.byteLength,
    uploadedAt: new Date().toISOString(),
  };
}
