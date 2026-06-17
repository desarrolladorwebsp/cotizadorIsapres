import { NextResponse } from "next/server";
import { readUsers } from "@/lib/api/user-store";
import type { UserRole } from "@/types/user";
import { requireAdminSession } from "@/lib/auth/require-auth";
import { apiErrorResponse } from "@/lib/api/api-error";

const VALID_ROLES: UserRole[] = ["CLIENT", "EXECUTIVE", "ADMIN"];

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role");

    if (roleParam && !VALID_ROLES.includes(roleParam as UserRole)) {
      return NextResponse.json(
        { error: "Rol de usuario inválido." },
        { status: 400 },
      );
    }

    const users = await readUsers(roleParam as UserRole | undefined);
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
