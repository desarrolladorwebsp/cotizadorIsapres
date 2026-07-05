import { NextResponse } from "next/server";
import {
  apiErrorResponse,
  parseJsonBody,
} from "@/lib/api/api-error";
import { readAdminById } from "@/lib/auth/account-store";
import { requireAdminSession } from "@/lib/auth/require-auth";
import { createStaffInvite } from "@/lib/auth/staff-invite-store";
import { isValidRut, formatRut } from "@/lib/auth/rut";
import { sendStaffActivationEmail } from "@/lib/email/send-staff-invite";
import { listPendingStaffInvites } from "@/lib/auth/staff-invite-store";
import { listStaffAccounts } from "@/lib/auth/account-store";
import type { CreateStaffAccountInput, StaffRealm } from "@/types/staff-account";

function isValidCreateInput(payload: unknown): payload is CreateStaffAccountInput {
  if (!payload || typeof payload !== "object") return false;

  const data = payload as Record<string, unknown>;

  return (
    (data.realm === "admin" || data.realm === "executive") &&
    typeof data.email === "string" &&
    data.email.trim().length > 0 &&
    (data.rut === undefined || typeof data.rut === "string")
  );
}

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const [accounts, pendingInvites] = await Promise.all([
      listStaffAccounts(),
      listPendingStaffInvites(),
    ]);
    return NextResponse.json({ accounts, pendingInvites });
  } catch (error) {
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    const { session } = await requireAdminSession(request);
    const payload = await parseJsonBody(request);

    if (!isValidCreateInput(payload)) {
      return NextResponse.json(
        { error: "Datos de invitación inválidos." },
        { status: 400 },
      );
    }

    const rutRaw = payload.rut?.trim();

    if (payload.realm === "executive") {
      if (!rutRaw) {
        return NextResponse.json(
          { error: "El RUT es obligatorio para invitar ejecutivos." },
          { status: 400 },
        );
      }
      if (!isValidRut(rutRaw)) {
        return NextResponse.json({ error: "El RUT no es válido." }, { status: 400 });
      }
    } else if (rutRaw && !isValidRut(rutRaw)) {
      return NextResponse.json({ error: "El RUT no es válido." }, { status: 400 });
    }

    const admin = await readAdminById(session.sub);
    const { token, invite } = await createStaffInvite({
      email: payload.email,
      realm: payload.realm as StaffRealm,
      rut: rutRaw ? formatRut(rutRaw) : undefined,
      invitedByAdminId: admin?.id,
    });

    await sendStaffActivationEmail({
      email: payload.email.trim().toLowerCase(),
      realm: payload.realm as StaffRealm,
      activationToken: token,
      rut: rutRaw ? formatRut(rutRaw) : null,
    });

    return NextResponse.json(
      {
        message:
          "Invitación enviada. La persona debe abrir el enlace del correo para crear su cuenta.",
        pendingInvite: invite,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/accounts", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
