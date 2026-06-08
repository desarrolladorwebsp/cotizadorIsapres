/** Carpeta raíz en Cloudinary para PDFs de planes de Isapre. */
export const PLAN_PDF_FOLDER = "cotizador/planes-pdf";

export const PLAN_PDF_MAX_BYTES = 15 * 1024 * 1024;

export const PLAN_PDF_ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
]);
