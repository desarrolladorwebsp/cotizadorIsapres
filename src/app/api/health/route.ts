import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import {
  getBlobClientConfig,
  resolvePlanPdfStorageBackend,
  useVercelBlobStorage,
} from "@/lib/plan-pdf-storage/provider";

export const runtime = "nodejs";

export async function GET() {
  const backend = resolvePlanPdfStorageBackend();
  const blobConfigured = Boolean(getBlobClientConfig());

  let blobSampleCount = 0;
  if (useVercelBlobStorage()) {
    try {
      const result = await list({
        limit: 1,
        prefix: "consalud/",
        ...getBlobClientConfig(),
      });
      blobSampleCount = result.blobs.length;
    } catch {
      blobSampleCount = -1;
    }
  }

  return NextResponse.json({
    ok: true,
    service: "cotizador-isapres",
    pdfStorage: {
      backend,
      blobConfigured,
      blobReachable: blobSampleCount >= 0,
      blobObjectsSample: blobSampleCount,
    },
    timestamp: new Date().toISOString(),
  });
}
