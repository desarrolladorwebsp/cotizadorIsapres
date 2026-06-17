import { NextResponse } from "next/server";
import { AUTH_REALM } from "@/lib/auth/constants";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie(AUTH_REALM.admin);
  return NextResponse.json({ ok: true });
}
