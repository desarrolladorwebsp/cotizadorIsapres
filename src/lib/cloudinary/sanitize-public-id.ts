export function sanitizePlanPdfPublicId(uniqueCode: string): string {
  const normalized = uniqueCode
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized.length > 0 ? normalized : "plan-sin-codigo";
}
