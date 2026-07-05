import { NextResponse } from "next/server";
import { updateClientPipeline } from "@/lib/api/client-pipeline-store";
import { apiErrorResponse, parseJsonBody } from "@/lib/api/api-error";
import { requireExecutiveOrAdminSession } from "@/lib/auth/require-auth";
import { AUTH_REALM } from "@/lib/auth/constants";
import type { UpdateClientPipelineInput } from "@/types/client-pipeline";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parsePipelinePayload(payload: unknown): UpdateClientPipelineInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Datos inválidos.");
  }

  const data = payload as Record<string, unknown>;
  const input: UpdateClientPipelineInput = {};

  if (data.pipelineStatus !== undefined) {
    if (typeof data.pipelineStatus !== "string") {
      throw new Error("Estado inválido.");
    }
    input.pipelineStatus = data.pipelineStatus as UpdateClientPipelineInput["pipelineStatus"];
  }

  if (data.checklist !== undefined) {
    input.checklist = data.checklist as UpdateClientPipelineInput["checklist"];
  }

  if (data.closedRecord !== undefined) {
    input.closedRecord =
      data.closedRecord === null
        ? null
        : (data.closedRecord as UpdateClientPipelineInput["closedRecord"]);
  }

  if (data.pipelineNotes !== undefined) {
    input.pipelineNotes =
      typeof data.pipelineNotes === "string" ? data.pipelineNotes : null;
  }

  return input;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { realm, user } = await requireExecutiveOrAdminSession(request);
    const { id } = await context.params;
    const payload = await parseJsonBody(request);
    const input = parsePipelinePayload(payload);

    const updated = await updateClientPipeline(id, input, {
      executiveAccountId: user.id,
      isAdmin: realm === AUTH_REALM.admin,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/executive/clients/[id]/pipeline", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
