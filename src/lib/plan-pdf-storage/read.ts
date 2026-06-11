import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { ApiError } from "@/lib/api/api-error";
import { resolveAbsolutePdfPath } from "@/lib/plan-pdf-storage/paths";

export async function readPlanPdfFile(storageKey: string): Promise<Buffer> {
  const absolutePath = resolveAbsolutePdfPath(storageKey);

  if (!existsSync(absolutePath)) {
    throw new ApiError("El PDF del plan no existe en el almacenamiento.", 404);
  }

  try {
    return await readFile(absolutePath);
  } catch (error) {
    console.error("Error al leer PDF local:", error);
    throw new ApiError("No se pudo leer el PDF del plan.", 500);
  }
}

export function planPdfFileExists(storageKey: string): boolean {
  try {
    const absolutePath = resolveAbsolutePdfPath(storageKey);
    return existsSync(absolutePath);
  } catch {
    return false;
  }
}
