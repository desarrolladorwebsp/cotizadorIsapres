import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "cotizador-isapres",
    timestamp: new Date().toISOString(),
  });
}
