import { NextResponse } from "next/server";
import { createQuote, readQuotes } from "@/lib/api/quote-store";
import type { CreateQuoteInput } from "@/types/quote";

function isValidCreateQuoteInput(payload: unknown): payload is CreateQuoteInput {
  if (!payload || typeof payload !== "object") return false;

  const data = payload as Record<string, unknown>;

  return (
    typeof data.fullName === "string" &&
    data.fullName.trim().length > 0 &&
    typeof data.email === "string" &&
    data.email.trim().length > 0 &&
    typeof data.phone === "string" &&
    data.phone.trim().length > 0
  );
}

export async function GET() {
  try {
    const quotes = await readQuotes();
    return NextResponse.json(quotes);
  } catch (error) {
    console.error("GET /api/quotes", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las cotizaciones." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;

    if (!isValidCreateQuoteInput(payload)) {
      return NextResponse.json(
        { error: "Datos de cotización inválidos." },
        { status: 400 },
      );
    }

    const quote = await createQuote(payload);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes", error);
    return NextResponse.json(
      { error: "No se pudo registrar la cotización." },
      { status: 500 },
    );
  }
}
