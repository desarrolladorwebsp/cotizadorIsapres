import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/api-error";
import {
  parseClientClosedRecord,
  resolveClientChecklist,
} from "@/lib/client-pipeline/constants";
import type { ClientPipelineStatus } from "@/types/client-pipeline";
import type { UserRecord, UserRole } from "@/types/user";
import type { User as DbUser, StaffAccount } from "@prisma/client";

export type UserWithExecutive = DbUser & {
  assignedExecutive?: Pick<StaffAccount, "id" | "fullName" | "email"> | null;
};

export function mapDbUser(user: UserWithExecutive): UserRecord {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    rut: user.rut,
    role: user.role as UserRole,
    active: user.active,
    assignedExecutiveId: user.assignedExecutiveId,
    assignedExecutiveName: user.assignedExecutive?.fullName ?? null,
    pipelineStatus: user.pipelineStatus as ClientPipelineStatus,
    checklist: resolveClientChecklist(user.pipelineChecklist),
    closedRecord: parseClientClosedRecord(user.pipelineClosedRecord),
    pipelineNotes: user.pipelineNotes,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function readUsers(role?: UserRole): Promise<UserRecord[]> {
  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return users.map(mapDbUser);
}

export async function readUserById(id: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
  return user ? mapDbUser(user) : null;
}

export async function readUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });
  return user ? mapDbUser(user) : null;
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  phone?: string | null;
  rut?: string | null;
  role?: UserRole;
  active?: boolean;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const user = await prisma.user.create({
    data: {
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() ?? null,
      rut: input.rut?.trim() ?? null,
      role: input.role ?? "CLIENT",
      active: input.active ?? true,
    },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return mapDbUser(user);
}

export async function upsertUserByEmail(
  input: CreateUserInput,
): Promise<UserRecord> {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() ?? null,
      rut: input.rut?.trim() ?? null,
      role: input.role ?? "CLIENT",
      active: input.active ?? true,
    },
    update: {
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() ?? null,
      rut: input.rut?.trim() ?? null,
      role: input.role ?? undefined,
      active: input.active ?? undefined,
    },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return mapDbUser(user);
}

export async function readClientsForExecutive(
  executiveAccountId: string,
): Promise<UserRecord[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      assignedExecutiveId: executiveAccountId,
    },
    orderBy: [{ fullName: "asc" }, { email: "asc" }],
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return users.map(mapDbUser);
}

async function syncClientQuotesExecutive(
  userId: string,
  executiveAccountId: string,
): Promise<void> {
  await prisma.quote.updateMany({
    where: { userId, executiveAccountId: null },
    data: { executiveAccountId },
  });
}

async function assertAssignableExecutive(
  executiveAccountId: string,
): Promise<void> {
  const executive = await prisma.staffAccount.findFirst({
    where: {
      id: executiveAccountId,
      role: "EXECUTIVE",
      active: true,
    },
    select: { id: true },
  });

  if (!executive) {
    throw new ApiError(
      "El ejecutivo seleccionado no existe o no está activo.",
      400,
      "INVALID_EXECUTIVE",
    );
  }
}

export async function assignUserToExecutive(
  userId: string,
  executiveAccountId: string | null,
): Promise<UserRecord> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!existing || existing.role !== "CLIENT") {
    throw new ApiError("Cliente no encontrado.", 404, "NOT_FOUND");
  }

  if (executiveAccountId) {
    await assertAssignableExecutive(executiveAccountId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { assignedExecutiveId: executiveAccountId },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  if (executiveAccountId) {
    await syncClientQuotesExecutive(userId, executiveAccountId);
  }

  return mapDbUser(user);
}
