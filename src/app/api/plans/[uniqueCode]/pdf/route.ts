import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/api-error";
import { readPlanByCode } from "@/lib/api/data-store";
import { buildPlanPdfFileName } from "@/lib/pdf-filename";
import {
  collectPlanPdfCleanupKeys,
  resolveStoredPlanPdfStorageKey,
} from "@/lib/plan-pdf-storage/paths";
import { planPdfFileExists, readPlanPdfFile } from "@/lib/plan-pdf-storage/read";

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

    const candidateKeys = collectPlanPdfCleanupKeys(
      plan.isapre,
      plan.unique_code,
      plan.pdf_public_id,
    );

    const storageKey =
      candidateKeys.find((key) => planPdfFileExists(key)) ??
      resolveStoredPlanPdfStorageKey(
        plan.pdf_public_id,
        plan.isapre,
        plan.unique_code,
      );

    if (!storageKey || !planPdfFileExists(storageKey)) {
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
