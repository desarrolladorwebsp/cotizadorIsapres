import { prisma } from "@/lib/prisma";
import type { UserRecord, UserRole } from "@/types/user";
import type { User as DbUser, ExecutiveAccount } from "@prisma/client";

type UserWithExecutive = DbUser & {
  assignedExecutive?: Pick<ExecutiveAccount, "id" | "fullName" | "email"> | null;
};

function mapDbUser(user: UserWithExecutive): UserRecord {
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

export async function assignUserToExecutive(
  userId: string,
  executiveAccountId: string | null,
): Promise<UserRecord> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { assignedExecutiveId: executiveAccountId },
    include: {
      assignedExecutive: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return mapDbUser(user);
}
