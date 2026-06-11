import { prisma } from "@/lib/prisma";
import type { UserRecord, UserRole } from "@/types/user";
import type { User as DbUser } from "@prisma/client";

function mapDbUser(user: DbUser): UserRecord {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    rut: user.rut,
    role: user.role as UserRole,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function readUsers(role?: UserRole): Promise<UserRecord[]> {
  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
  });

  return users.map(mapDbUser);
}

export async function readUserById(id: string): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? mapDbUser(user) : null;
}

export async function readUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
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
  });

  return mapDbUser(user);
}
