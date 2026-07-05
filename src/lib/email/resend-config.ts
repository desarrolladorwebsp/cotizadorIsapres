import { ApiError } from "@/lib/api/api-error";

/** Correo visible al usuario que cotiza en el cotizador / widget. */
export const DEFAULT_COTIZACION_FROM_EMAIL =
  "Cotizador Premium <cotizaciones@cotizadorpremium.cl>";

/** Correo del equipo (staff, alertas internas). */
export const DEFAULT_EQUIPO_FROM_EMAIL =
  "Cotizador Premium <equipo@cotizadorpremium.cl>";

/** Buzón que recibe alertas de nuevas cotizaciones. */
export const DEFAULT_EQUIPO_NOTIFY_EMAIL = "equipo@cotizadorpremium.cl";

export function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new ApiError(
      "Resend no está configurado. Agrega RESEND_API_KEY en las variables de entorno.",
      500,
    );
  }

  return apiKey;
}

export function getCotizacionFromEmail(): string {
  return (
    process.env.RESEND_COTIZACION_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_COTIZACION_FROM_EMAIL
  );
}

export function getEquipoFromEmail(): string {
  return (
    process.env.RESEND_EQUIPO_FROM_EMAIL?.trim() ||
    DEFAULT_EQUIPO_FROM_EMAIL
  );
}

export function getEquipoNotifyEmail(): string {
  return (
    process.env.EQUIPO_NOTIFY_EMAIL?.trim() ||
    process.env.COTIZACION_NOTIFY_EMAIL?.trim() ||
    DEFAULT_EQUIPO_NOTIFY_EMAIL
  );
}
