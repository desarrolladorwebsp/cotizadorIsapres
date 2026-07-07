import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/api-error";
import { getCachedHealthPlans } from "@/lib/api/plan-catalog-cache";

/** Catálogo completo para filtrado en cliente (cotizador público y ejecutivos). */
export async function GET() {
  try {
    const plans = await getCachedHealthPlans();

    return NextResponse.json(plans, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GET /api/plans/catalog", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
