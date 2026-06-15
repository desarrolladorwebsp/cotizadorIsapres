import { getDownloadUrl } from "@vercel/blob";
import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/api-error";
import { readPlanByCode } from "@/lib/api/data-store";
import { buildPlanPdfFileName } from "@/lib/pdf-filename";
import {
  isVercelBlobUrl,
  resolveBlobPlanPdfDownloadUrl,
} from "@/lib/plan-pdf-storage/blob";
import {
  collectPlanPdfCleanupKeys,
  resolveStoredPlanPdfStorageKey,
} from "@/lib/plan-pdf-storage/paths";
import {
  planPdfFileExistsAsync,
  readPlanPdfFile,
} from "@/lib/plan-pdf-storage/read";
import { useVercelBlobStorage } from "@/lib/plan-pdf-storage/provider";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ uniqueCode: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { uniqueCode } = await context.params;
    const decodedCode = decodeURIComponent(uniqueCode);
    const plan = await readPlanByCode(decodedCode);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado." },
        { status: 404 },
      );
    }

    const directUrl = plan.pdf_url?.trim();
    if (directUrl && isVercelBlobUrl(directUrl)) {
      return NextResponse.redirect(getDownloadUrl(directUrl), 307);
    }

    if (useVercelBlobStorage()) {
      const candidateKeys = collectPlanPdfCleanupKeys(
        plan.isapre,
        plan.unique_code,
        plan.pdf_public_id,
      );

      for (const key of candidateKeys) {
        const blobDownloadUrl = await resolveBlobPlanPdfDownloadUrl(key);
        if (blobDownloadUrl) {
          return NextResponse.redirect(blobDownloadUrl, 307);
        }
      }

      const fallbackKey = resolveStoredPlanPdfStorageKey(
        plan.pdf_public_id,
        plan.isapre,
        plan.unique_code,
      );

      if (fallbackKey) {
        const blobDownloadUrl = await resolveBlobPlanPdfDownloadUrl(fallbackKey);
        if (blobDownloadUrl) {
          return NextResponse.redirect(blobDownloadUrl, 307);
        }
      }
    }

    const candidateKeys = collectPlanPdfCleanupKeys(
      plan.isapre,
      plan.unique_code,
      plan.pdf_public_id,
    );

    let storageKey: string | null = null;
    for (const key of candidateKeys) {
      if (await planPdfFileExistsAsync(key)) {
        storageKey = key;
        break;
      }
    }

    if (!storageKey) {
      storageKey = resolveStoredPlanPdfStorageKey(
        plan.pdf_public_id,
        plan.isapre,
        plan.unique_code,
      );

      if (storageKey && !(await planPdfFileExistsAsync(storageKey))) {
        storageKey = null;
      }
    }

    if (!storageKey) {
      return NextResponse.json(
        { error: "Este plan no tiene PDF disponible." },
        { status: 404 },
      );
    }

    const fileBuffer = await readPlanPdfFile(storageKey);
    const fileName = buildPlanPdfFileName(plan.unique_code);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(fileBuffer.byteLength),
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/plans/[uniqueCode]/pdf", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
