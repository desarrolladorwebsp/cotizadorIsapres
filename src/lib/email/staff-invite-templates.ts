import { escapeHtml } from "@/lib/email/escape-html";
import type { StaffRealm } from "@/types/staff-account";

const BRAND_COLOR = "#f58220";
const BRAND_NAME = "Cotízalo Antes";

function emailShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:${BRAND_COLOR};padding:20px 24px;">
                <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${BRAND_NAME}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#fafafa;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#888;text-align:center;">
                  Acceso al cotizador virtual · ${BRAND_NAME}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function resolveRealmLabel(realm: StaffRealm): string {
  return realm === "admin" ? "administrador" : "ejecutivo";
}

export function buildStaffInviteEmailHtml(input: {
  fullName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  realm: StaffRealm;
}): string {
  const roleLabel = resolveRealmLabel(input.realm);

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#222;">Tu acceso al cotizador</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">
      Hola ${escapeHtml(input.fullName)}, se creó tu cuenta de <strong>${escapeHtml(roleLabel)}</strong>.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">
      Usa la clave temporal de abajo para ingresar. Al iniciar sesión deberás definir una contraseña nueva.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border:1px solid #eee;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:12px 14px;background:#fafafa;font-size:13px;color:#666;width:34%;">Correo</td>
        <td style="padding:12px 14px;font-size:14px;color:#222;">${escapeHtml(input.email)}</td>
      </tr>
      <tr>
        <td style="padding:12px 14px;background:#fafafa;font-size:13px;color:#666;border-top:1px solid #eee;">Clave temporal</td>
        <td style="padding:12px 14px;font-size:16px;font-weight:700;color:#222;border-top:1px solid #eee;font-family:Consolas,Monaco,monospace;">${escapeHtml(input.temporaryPassword)}</td>
      </tr>
    </table>
    <p style="margin:0 0 20px;text-align:center;">
      <a href="${escapeHtml(input.loginUrl)}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:999px;">
        Iniciar sesión
      </a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#666;">
      Por seguridad, no compartas esta clave. Si no esperabas este correo, ignóralo o contacta al administrador.
    </p>`;

  return emailShell("Acceso al cotizador", body);
}

export function buildStaffInviteEmailSubject(realm: StaffRealm): string {
  return realm === "admin"
    ? "Tu acceso de administrador — Cotizador Virtual"
    : "Tu acceso de ejecutivo — Cotizador Virtual";
}
