import { Resend } from "resend";
import { ApiError } from "@/lib/api/api-error";
import type { CotizacionNotifyInput } from "@/lib/email/cotizacion-notify-schema";
import {
  buildAdminCotizacionEmailHtml,
  buildAdminCotizacionSubject,
  buildUserCotizacionEmailHtml,
  buildUserCotizacionSubject,
} from "@/lib/email/cotizacion-notify-templates";
import { buildInlineAttachmentsForHtml } from "@/lib/email/email-inline-assets";
import {
  getCotizacionFromEmail,
  getEquipoFromEmail,
  getEquipoNotifyEmail,
  getResendApiKey,
} from "@/lib/email/resend-config";

export interface CotizacionNotifyResult {
  userId: string;
  adminId: string;
}

export async function sendCotizacionNotifyEmails(
  data: CotizacionNotifyInput,
): Promise<CotizacionNotifyResult> {
  const resend = new Resend(getResendApiKey());
  const cotizacionFrom = getCotizacionFromEmail();
  const equipoFrom = getEquipoFromEmail();
  const equipoNotify = getEquipoNotifyEmail();

  const userHtml = buildUserCotizacionEmailHtml(data);
  const adminHtml = buildAdminCotizacionEmailHtml(data);
  const userAttachments = buildInlineAttachmentsForHtml(userHtml);
  const adminAttachments = buildInlineAttachmentsForHtml(adminHtml);

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: cotizacionFrom,
      to: data.email,
      subject: buildUserCotizacionSubject(data),
      html: userHtml,
      attachments: userAttachments.length > 0 ? userAttachments : undefined,
    }),
    resend.emails.send({
      from: equipoFrom,
      to: equipoNotify,
      replyTo: data.email,
      subject: buildAdminCotizacionSubject(data),
      html: adminHtml,
      attachments: adminAttachments.length > 0 ? adminAttachments : undefined,
    }),
  ]);

  if (userResult.error || adminResult.error) {
    const details = [userResult.error?.message, adminResult.error?.message]
      .filter(Boolean)
      .join(" · ");
    throw new ApiError(
      details
        ? `No se pudieron enviar los correos: ${details}`
        : "No se pudieron enviar los correos de cotización.",
      500,
    );
  }

  const userId = userResult.data?.id;
  const adminId = adminResult.data?.id;

  if (!userId || !adminId) {
    throw new ApiError(
      "Resend no devolvió los IDs de los correos enviados.",
      500,
    );
  }

  return { userId, adminId };
}
