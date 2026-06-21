import { Resend } from "resend";
import { ApiError } from "@/lib/api/api-error";
import {
  ADMIN_LOGIN_PATH,
  EXECUTIVE_LOGIN_PATH,
} from "@/lib/auth/constants";
import {
  buildStaffInviteEmailHtml,
  buildStaffInviteEmailSubject,
} from "@/lib/email/staff-invite-templates";
import type { StaffRealm } from "@/types/staff-account";

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Cotízalo Antes <noreply@cotizaloantes.cl>";

  if (!apiKey) {
    throw new ApiError(
      "Resend no está configurado. Agrega RESEND_API_KEY en las variables de entorno.",
      500,
    );
  }

  return { apiKey, fromEmail };
}

function resolveAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }

  return "http://localhost:3000";
}

export async function sendStaffInviteEmail(input: {
  fullName: string;
  email: string;
  temporaryPassword: string;
  realm: StaffRealm;
}): Promise<string> {
  const { apiKey, fromEmail } = getResendConfig();
  const resend = new Resend(apiKey);
  const baseUrl = resolveAppBaseUrl();
  const loginPath =
    input.realm === "admin" ? ADMIN_LOGIN_PATH : EXECUTIVE_LOGIN_PATH;
  const loginUrl = `${baseUrl.replace(/\/$/, "")}${loginPath}`;

  const result = await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: buildStaffInviteEmailSubject(input.realm),
    html: buildStaffInviteEmailHtml({
      fullName: input.fullName,
      email: input.email,
      temporaryPassword: input.temporaryPassword,
      loginUrl,
      realm: input.realm,
    }),
  });

  if (result.error) {
    throw new ApiError(
      `No se pudo enviar el correo de acceso: ${result.error.message}`,
      500,
    );
  }

  const messageId = result.data?.id;
  if (!messageId) {
    throw new ApiError("Resend no devolvió el ID del correo enviado.", 500);
  }

  return messageId;
}
