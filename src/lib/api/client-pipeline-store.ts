import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/api-error";
import { mapDbUser, type UserWithExecutive } from "@/lib/api/user-store";
import {
  CLIENT_PIPELINE_STATUS_OPTIONS,
  parseClientClosedRecord,
} from "@/lib/client-pipeline/constants";
import type {
  ClientClosedRecord,
  UpdateClientPipelineInput,
} from "@/types/client-pipeline";
import type { UserRecord } from "@/types/user";
import type { Prisma } from "@prisma/client";

async function readClientOrThrow(userId: string): Promise<UserWithExecutive> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  if (!user || user.role !== "CLIENT") {
    throw new ApiError("Cliente no encontrado.", 404, "NOT_FOUND");
  }

  return user;
}

function assertExecutiveAccess(
  user: UserWithExecutive,
  executiveAccountId: string,
  isAdmin: boolean,
): void {
  if (isAdmin) return;
  if (user.assignedExecutiveId !== executiveAccountId) {
    throw new ApiError(
      "No tienes permiso para gestionar este cliente.",
      403,
      "FORBIDDEN",
    );
  }
}

function validateClosedRecord(
  record: ClientClosedRecord | null | undefined,
): ClientClosedRecord | null {
  if (!record) return null;
  if (!record.isapre.trim()) {
    throw new ApiError(
      "Indica la Isapre al cerrar el cliente.",
      400,
      "INVALID_CLOSED_RECORD",
    );
  }
  if (!record.closedAt.trim()) {
    throw new ApiError(
      "Indica la fecha de cierre.",
      400,
      "INVALID_CLOSED_RECORD",
    );
  }
  return {
    isapre: record.isapre.trim(),
    planCode: record.planCode?.trim() || null,
    planName: record.planName?.trim() || null,
    closedAt: record.closedAt.trim(),
    finalPriceUf: record.finalPriceUf?.trim() || null,
    finalPriceClp: record.finalPriceClp?.trim() || null,
    isapreReference: record.isapreReference?.trim() || null,
    notes: record.notes?.trim() || null,
  };
}

export async function updateClientPipeline(
  userId: string,
  input: UpdateClientPipelineInput,
  actor: { executiveAccountId: string; isAdmin: boolean },
): Promise<UserRecord> {
  const existing = await readClientOrThrow(userId);
  assertExecutiveAccess(existing, actor.executiveAccountId, actor.isAdmin);

  const data: Prisma.UserUpdateInput = {};

  if (input.pipelineStatus !== undefined) {
    if (!CLIENT_PIPELINE_STATUS_OPTIONS.includes(input.pipelineStatus)) {
      throw new ApiError("Estado de cliente inválido.", 400, "INVALID_STATUS");
    }
    data.pipelineStatus = input.pipelineStatus;
  }

  if (input.checklist !== undefined) {
    data.pipelineChecklist = {
      items: input.checklist.items,
      updatedAt: new Date().toISOString(),
    } as unknown as Prisma.InputJsonValue;
  }

  if (input.pipelineNotes !== undefined) {
    data.pipelineNotes = input.pipelineNotes?.trim() || null;
  }

  if (input.closedRecord !== undefined) {
    data.pipelineClosedRecord = validateClosedRecord(
      input.closedRecord,
    ) as unknown as Prisma.InputJsonValue;
  }

  const nextStatus = input.pipelineStatus ?? existing.pipelineStatus;
  if (nextStatus === "CERRADO") {
    const closed =
      input.closedRecord !== undefined
        ? validateClosedRecord(input.closedRecord)
        : parseClientClosedRecord(existing.pipelineClosedRecord);
    if (!closed) {
      throw new ApiError(
        "Completa el registro de cierre antes de marcar como Cerrado.",
        400,
        "INVALID_CLOSED_RECORD",
      );
    }
    data.pipelineClosedRecord = closed as unknown as Prisma.InputJsonValue;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return mapDbUser(user);
}
