import { NextResponse } from "next/server";
import { AUTH_REALM } from "@/lib/auth/constants";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie(AUTH_REALM.executive);
  return NextResponse.json({ ok: true });
}
