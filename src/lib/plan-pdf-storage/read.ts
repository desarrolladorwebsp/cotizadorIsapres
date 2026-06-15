import {
  blobPlanPdfExists,
  readBlobPlanPdf,
} from "@/lib/plan-pdf-storage/blob";
import {
  localPlanPdfExists,
  readLocalPlanPdf,
} from "@/lib/plan-pdf-storage/local";
import { useVercelBlobStorage } from "@/lib/plan-pdf-storage/provider";

export async function readPlanPdfFile(storageKey: string): Promise<Buffer> {
  if (useVercelBlobStorage()) {
    return readBlobPlanPdf(storageKey);
  }

  return readLocalPlanPdf(storageKey);
}

export function planPdfFileExists(storageKey: string): boolean {
  // Sync check only works for local disk; blob uses async variant below.
  if (!useVercelBlobStorage()) {
    return localPlanPdfExists(storageKey);
  }

  return false;
}

export async function planPdfFileExistsAsync(storageKey: string): Promise<boolean> {
  if (useVercelBlobStorage()) {
    return blobPlanPdfExists(storageKey);
  }

  return localPlanPdfExists(storageKey);
}
