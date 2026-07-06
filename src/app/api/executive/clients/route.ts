import { NextResponse } from "next/server";
import {
  createManualClient,
  readClientRecords,
  readClientsForExecutive,
} from "@/lib/api/user-store";
import { parseClientProfilePayload } from "@/lib/api/parse-client-profile";
import { apiErrorResponse, parseJsonBody } from "@/lib/api/api-error";
import { requireExecutiveOrAdminSession } from "@/lib/auth/require-auth";
import { AUTH_REALM } from "@/lib/auth/constants";
import type { CreateManualClientInput } from "@/types/user";

function parseCreateClientPayload(payload: unknown): CreateManualClientInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Datos inválidos.");
  }

  const data = payload as Record<string, unknown>;
  const profile = parseClientProfilePayload(data);

  return {
    ...profile,
    pipelineNotes:
      typeof data.pipelineNotes === "string" ? data.pipelineNotes : null,
    assignedExecutiveId:
      typeof data.assignedExecutiveId === "string"
        ? data.assignedExecutiveId
        : null,
  };
}

export async function GET(request: Request) {
  try {
    const { realm, user } = await requireExecutiveOrAdminSession(request);

    const clients =
      realm === AUTH_REALM.admin
        ? await readClientRecords()
        : await readClientsForExecutive(user.id);

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/executive/clients", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    const { realm, user } = await requireExecutiveOrAdminSession(request);
    const payload = await parseJsonBody(request);
    const input = parseCreateClientPayload(payload);

    const created = await createManualClient(input, {
      executiveAccountId: user.id,
      isAdmin: realm === AUTH_REALM.admin,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/executive/clients", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
