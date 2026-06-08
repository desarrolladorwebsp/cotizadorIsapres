import { PLAN_PDF_FOLDER } from "@/lib/cloudinary/constants";
import { sanitizeIsapreFolderName } from "@/lib/cloudinary/sanitize-isapre-folder";
import { sanitizePlanPdfPublicId } from "@/lib/cloudinary/sanitize-public-id";

/** Ej: cotizador/planes-pdf/consalud */
export function buildPlanPdfFolder(isapre: string): string {
  return `${PLAN_PDF_FOLDER}/${sanitizeIsapreFolderName(isapre)}`;
}

/** public_id completo en Cloudinary. Ej: cotizador/planes-pdf/consalud/13-sf1001-26 */
export function buildPlanPdfPublicPath(
  isapre: string,
  uniqueCode: string,
): string {
  return `${buildPlanPdfFolder(isapre)}/${sanitizePlanPdfPublicId(uniqueCode)}`;
}
