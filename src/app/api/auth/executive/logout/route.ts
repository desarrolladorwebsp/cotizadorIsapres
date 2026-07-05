import { NextResponse } from "next/server";
import { clearAllStaffSessionCookies } from "@/lib/auth/session";

/** @deprecated Usar POST /api/auth/logout */
export async function POST() {
  await clearAllStaffSessionCookies();
  return NextResponse.json({ ok: true });
}
