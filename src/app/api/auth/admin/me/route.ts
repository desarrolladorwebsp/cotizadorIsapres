import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/api-error";
import { requireAdminSession } from "@/lib/auth/require-auth";

export async function GET() {
  try {
    const { user } = await requireAdminSession();
    return NextResponse.json({ user });
  } catch (error) {
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
