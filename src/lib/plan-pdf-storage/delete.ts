import {
  deleteBlobPlanPdf,
} from "@/lib/plan-pdf-storage/blob";
import { deleteLocalPlanPdf } from "@/lib/plan-pdf-storage/local";
import { useVercelBlobStorage } from "@/lib/plan-pdf-storage/provider";

export async function deletePlanPdfFile(storageKey: string): Promise<boolean> {
  if (useVercelBlobStorage()) {
    return deleteBlobPlanPdf(storageKey);
  }

  return deleteLocalPlanPdf(storageKey);
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
          `No se pudo eliminar el PDF (${storageKey}):`,
          error,
        );
      }
    }),
  );
}
