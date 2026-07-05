import { NextResponse } from "next/server";
import { readClientsForExecutive, readUsers } from "@/lib/api/user-store";
import { apiErrorResponse } from "@/lib/api/api-error";
import { requireExecutiveOrAdminSession } from "@/lib/auth/require-auth";
import { AUTH_REALM } from "@/lib/auth/constants";

export async function GET(request: Request) {
  try {
    const { realm, user } = await requireExecutiveOrAdminSession(request);

    const clients =
      realm === AUTH_REALM.admin
        ? await readUsers("CLIENT")
        : await readClientsForExecutive(user.id);

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET /api/executive/clients", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
