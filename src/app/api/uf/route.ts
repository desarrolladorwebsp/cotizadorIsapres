import { buildFallbackUfIndicator, fetchUfIndicator } from "@/lib/uf-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const indicator = await fetchUfIndicator();
    return Response.json(indicator, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch {
    return Response.json(buildFallbackUfIndicator(), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
      },
    });
  }
}
