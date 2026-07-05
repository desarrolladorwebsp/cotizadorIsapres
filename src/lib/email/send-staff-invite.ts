import { Resend } from "resend";
import { ApiError } from "@/lib/api/api-error";
import {
  ADMIN_ACTIVATE_ACCOUNT_PATH,
  EXECUTIVE_ACTIVATE_ACCOUNT_PATH,
} from "@/lib/auth/constants";
import {
  buildStaffActivationEmailHtml,
  buildStaffActivationEmailSubject,
  buildStaffInviteEmailHtml,
  buildStaffInviteEmailSubject,
} from "@/lib/email/staff-invite-templates";
import { getEquipoFromEmail, getResendApiKey } from "@/lib/email/resend-config";
import { resolveServerAppBaseUrl } from "@/lib/platform/routing";
import type { StaffRealm } from "@/types/staff-account";

/** Invitación con enlace de activación (flujo principal). */
export async function sendStaffActivationEmail(input: {
  email: string;
  realm: StaffRealm;
  activationToken: string;
  rut?: string | null;
  request?: Request;
}): Promise<string> {
  const resend = new Resend(getResendApiKey());
  const fromEmail = getEquipoFromEmail();
  const baseUrl = resolveServerAppBaseUrl(input.request).replace(/\/$/, "");
  const activatePath =
    input.realm === "admin"
      ? ADMIN_ACTIVATE_ACCOUNT_PATH
      : EXECUTIVE_ACTIVATE_ACCOUNT_PATH;
  const activationUrl = `${baseUrl}${activatePath}?token=${encodeURIComponent(input.activationToken)}`;

  const result = await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: buildStaffActivationEmailSubject(input.realm),
    html: buildStaffActivationEmailHtml({
      email: input.email,
      activationUrl,
      realm: input.realm,
      rut: input.rut,
    }),
  });

  if (result.error) {
    throw new ApiError(
      `No se pudo enviar el correo de invitación: ${result.error.message}`,
      500,
    );
  }

  const messageId = result.data?.id;
  if (!messageId) {
    throw new ApiError("Resend no devolvió el ID del correo enviado.", 500);
  }

  return messageId;
}

/** Legacy: clave temporal (cuentas creadas antes del flujo por enlace). */
export async function sendStaffInviteEmail(input: {
  fullName: string;
  email: string;
  temporaryPassword: string;
  realm: StaffRealm;
  request?: Request;
}): Promise<string> {
  const resend = new Resend(getResendApiKey());
  const fromEmail = getEquipoFromEmail();
  const baseUrl = resolveServerAppBaseUrl(input.request).replace(/\/$/, "");
  const loginPath = "/cotizador/acceso";
  const loginUrl = `${baseUrl}${loginPath}`;

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
