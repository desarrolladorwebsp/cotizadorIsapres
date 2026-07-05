import { NextResponse } from "next/server";
import { clearAllStaffSessionCookies } from "@/lib/auth/session";

export async function POST() {
  await clearAllStaffSessionCookies();
  return NextResponse.json({ ok: true });
}
