/** URL de descarga directa para PDFs alojados en Cloudinary. */
export function getPlanPdfDownloadUrl(pdfUrl: string): string {
  if (
    pdfUrl.includes("res.cloudinary.com") &&
    pdfUrl.includes("/upload/") &&
    !pdfUrl.includes("/upload/fl_attachment/")
  ) {
    return pdfUrl.replace("/upload/", "/upload/fl_attachment/");
  }

  return pdfUrl;
}
