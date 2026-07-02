import { NextResponse } from "next/server";
import {
  assignQuoteToExecutive,
  readQuoteById,
  updateQuoteAssignment,
} from "@/lib/api/quote-store";
import { apiErrorResponse, parseJsonBody } from "@/lib/api/api-error";
import {
  requireAdminSession,
  requireExecutiveSession,
} from "@/lib/auth/require-auth";
import type { QuoteStatus } from "@/types/quote";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = new Set<QuoteStatus>([
  "PENDING",
  "CONTACTED",
  "CONVERTED",
  "CANCELLED",
]);

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await parseJsonBody(request)) as Record<string, unknown>;

    let isAdmin = false;
    let executiveId: string | null = null;

    try {
      await requireAdminSession(request);
      isAdmin = true;
    } catch {
      const executive = await requireExecutiveSession(request);
      executiveId = executive.user.id;
    }

    const quote = await readQuoteById(id);
    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada." }, { status: 404 });
    }

    const status =
      typeof payload.status === "string" &&
      VALID_STATUSES.has(payload.status as QuoteStatus)
        ? (payload.status as QuoteStatus)
        : undefined;

    if (payload.assignToMe === true) {
      if (!executiveId) {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }

      const updated = await assignQuoteToExecutive(id, executiveId);
      return NextResponse.json(updated);
    }

    if (payload.executiveAccountId !== undefined) {
      if (!isAdmin) {
        return NextResponse.json({ error: "No autorizado." }, { status: 403 });
      }

      const executiveAccountId =
        payload.executiveAccountId === null
          ? null
          : typeof payload.executiveAccountId === "string"
            ? payload.executiveAccountId
            : null;

      const updated = await updateQuoteAssignment({
        quoteId: id,
        executiveAccountId,
        status,
      });
      return NextResponse.json(updated);
    }

    if (status && isAdmin) {
      const updated = await updateQuoteAssignment({
        quoteId: id,
        executiveAccountId: quote.executiveAccountId ?? null,
        status,
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Sin cambios válidos." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/quotes/[id]", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
