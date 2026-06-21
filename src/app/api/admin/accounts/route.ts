import { NextResponse } from "next/server";
import {
  apiErrorResponse,
  parseJsonBody,
} from "@/lib/api/api-error";
import {
  createStaffAccount,
  listStaffAccounts,
} from "@/lib/auth/account-store";
import { requireAdminSession } from "@/lib/auth/require-auth";
import { sendStaffInviteEmail } from "@/lib/email/send-staff-invite";
import type { CreateStaffAccountInput, StaffRealm } from "@/types/staff-account";
import type { SubscriptionStatus } from "@prisma/client";

const SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "TRIAL",
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
]);

function isValidCreateInput(payload: unknown): payload is CreateStaffAccountInput {
  if (!payload || typeof payload !== "object") return false;

  const data = payload as Record<string, unknown>;

  return (
    (data.realm === "admin" || data.realm === "executive") &&
    typeof data.email === "string" &&
    data.email.trim().length > 0 &&
    typeof data.fullName === "string" &&
    data.fullName.trim().length > 0 &&
    (data.phone === undefined || typeof data.phone === "string") &&
    (data.rut === undefined || typeof data.rut === "string") &&
    (data.subscriptionStatus === undefined ||
      (typeof data.subscriptionStatus === "string" &&
        SUBSCRIPTION_STATUSES.has(data.subscriptionStatus as SubscriptionStatus)))
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const accounts = await listStaffAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);
    const payload = await parseJsonBody(request);

    if (!isValidCreateInput(payload)) {
      return NextResponse.json(
        { error: "Datos de usuario inválidos." },
        { status: 400 },
      );
    }

    const { account, temporaryPassword } = await createStaffAccount(payload);

    await sendStaffInviteEmail({
      fullName: account.fullName,
      email: account.email,
      temporaryPassword,
      realm: payload.realm as StaffRealm,
    });

    return NextResponse.json(
      {
        account,
        message: "Usuario creado. Se envió la clave temporal al correo indicado.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/accounts", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
