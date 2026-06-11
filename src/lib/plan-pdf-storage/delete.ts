import { unlink } from "fs/promises";
import { existsSync } from "fs";
import { resolveAbsolutePdfPath } from "@/lib/plan-pdf-storage/paths";

export async function deletePlanPdfFile(storageKey: string): Promise<boolean> {
  try {
    const absolutePath = resolveAbsolutePdfPath(storageKey);
    if (!existsSync(absolutePath)) return false;
    await unlink(absolutePath);
    return true;
  } catch {
    return false;
  }
}

export async function deletePlanPdfVariants(storageKeys: string[]): Promise<void> {
  const uniqueKeys = Array.from(
    new Set(storageKeys.map((key) => key.trim()).filter(Boolean)),
  );

  await Promise.all(
    uniqueKeys.map(async (storageKey) => {
      try {
        await deletePlanPdfFile(storageKey);
      } catch (error) {
        console.warn(
          `No se pudo eliminar el PDF local (${storageKey}):`,
          error,
        );
      }
    }),
  );
}
