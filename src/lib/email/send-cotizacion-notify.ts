import { Resend } from "resend";
import { ApiError } from "@/lib/api/api-error";
import type { CotizacionNotifyInput } from "@/lib/email/cotizacion-notify-schema";
import {
  buildAdminCotizacionEmailHtml,
  buildAdminCotizacionSubject,
  buildUserCotizacionEmailHtml,
} from "@/lib/email/cotizacion-notify-templates";

export interface CotizacionNotifyResult {
  userId: string;
  adminId: string;
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Cotízalo Antes <noreply@cotizaloantes.cl>";
  const adminEmail =
    process.env.COTIZACION_NOTIFY_EMAIL?.trim() || "cotizador@cotizaloantes.cl";

  if (!apiKey) {
    throw new ApiError(
      "Resend no está configurado. Agrega RESEND_API_KEY en las variables de entorno.",
      500,
    );
  }

  return { apiKey, fromEmail, adminEmail };
}

export async function sendCotizacionNotifyEmails(
  data: CotizacionNotifyInput,
): Promise<CotizacionNotifyResult> {
  const { apiKey, fromEmail, adminEmail } = getResendConfig();
  const resend = new Resend(apiKey);

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: "Tu cotización de Isapre en Cotízalo Antes",
      html: buildUserCotizacionEmailHtml(data),
    }),
    resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: data.email,
      subject: buildAdminCotizacionSubject(data),
      html: buildAdminCotizacionEmailHtml(data),
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
