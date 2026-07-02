import { escapeHtml } from "@/lib/email/escape-html";
import type { CotizacionNotifyInput } from "@/lib/email/cotizacion-notify-schema";

const BRAND_COLOR = "#f58220";
const BRAND_NAME = "Cotízalo Antes";

function formatIncomeClp(raw: string | undefined): string {
  if (!raw?.trim()) return "—";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return escapeHtml(raw.trim());
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(digits));
}

function formatDependents(cargas: number[] | undefined): string {
  if (!cargas?.length) return "Sin asegurados adicionales";
  if (cargas.length === 1) return `1 asegurado adicional (${cargas[0]} años)`;
  const ages = cargas.map((age) => `${age}`).join(" y ");
  return `${cargas.length} asegurados adicionales (${ages} años)`;
}

function formatMoneda(moneda: CotizacionNotifyInput["moneda"]): string {
  if (moneda === "uf") return "UF";
  if (moneda === "clp") return "Pesos chilenos";
  return "—";
}

function formatIsapres(isapres: string[] | undefined): string {
  if (!isapres?.length) return "Todas";
  return isapres.join(", ");
}

function renderTableRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#222;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;
}

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
                  Este correo fue enviado por ${BRAND_NAME}. Si no solicitaste esta cotización, puedes ignorarlo.
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

function renderButton(label: string, href: string): string {
  const safeHref = escapeHtml(href);
  return `<p style="margin:24px 0 0;text-align:center;">
    <a href="${safeHref}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

export function buildUserCotizacionEmailHtml(
  data: CotizacionNotifyInput,
): string {
  const rows = [
    renderTableRow("Región", escapeHtml(data.region)),
    renderTableRow("Edad titular", escapeHtml(String(data.edad))),
    renderTableRow("Sexo", escapeHtml(data.sexo ?? "No indicado")),
    renderTableRow("Ingreso mensual líquido", formatIncomeClp(data.ingreso)),
    renderTableRow(
      "Asegurados adicionales",
      escapeHtml(formatDependents(data.cargas)),
    ),
  ].join("");

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#222;">Tu cotización de Isapre</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">
      Recibimos tu solicitud de cotización en ${BRAND_NAME}. Este es un resumen de los datos que enviaste:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
      ${rows}
    </table>
    ${renderButton("Ver mi cotización", data.cotizadorUrl)}
  `;

  return emailShell("Tu cotización de Isapre en Cotízalo Antes", body);
}

export function buildAdminCotizacionSubject(
  data: CotizacionNotifyInput,
): string {
  if (data.plan?.codigo) {
    return `Nueva cotización — ${data.plan.codigo} — ${data.email}`;
  }
  if (data.busqueda?.trim()) {
    return `Nueva cotización — ${data.busqueda.trim()} — ${data.email}`;
  }
  return `Nueva cotización — ${data.email}`;
}

export function buildAdminCotizacionEmailHtml(
  data: CotizacionNotifyInput,
): string {
  const timestamp = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  const planBlock = data.plan
    ? `<div style="margin:0 0 20px;padding:16px;border:1px solid #ffd4ad;background:#fff7ef;border-radius:10px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND_COLOR};">Plan solicitado</p>
        <p style="margin:0 0 4px;font-size:16px;font-weight:700;color:#222;">${escapeHtml(data.plan.codigo)} · ${escapeHtml(data.plan.isapre)}</p>
        <p style="margin:0;font-size:14px;color:#444;">${escapeHtml(data.plan.precioUf)} · ${escapeHtml(data.plan.precioClp)}</p>
      </div>`
    : "";

  const rows = [
    renderTableRow("Correo del usuario", escapeHtml(data.email)),
    renderTableRow("Región", escapeHtml(data.region)),
    renderTableRow("Edad titular", escapeHtml(String(data.edad))),
    renderTableRow("Sexo", escapeHtml(data.sexo ?? "No indicado")),
    renderTableRow("Ingreso mensual líquido", formatIncomeClp(data.ingreso)),
    renderTableRow(
      "Asegurados adicionales",
      escapeHtml(formatDependents(data.cargas)),
    ),
    renderTableRow("Búsqueda", escapeHtml(data.busqueda?.trim() || "—")),
    renderTableRow("Ordenar por", escapeHtml(data.orden?.trim() || "—")),
    renderTableRow("Moneda", escapeHtml(formatMoneda(data.moneda))),
    renderTableRow(
      "Isapres filtradas",
      escapeHtml(formatIsapres(data.isapres)),
    ),
    renderTableRow(
      "Sitio de origen",
      escapeHtml(data.partnerEntityName ?? data.partnerEntitySlug ?? "—"),
    ),
  ];

  if (data.plan) {
    rows.push(
      renderTableRow("Código plan", escapeHtml(data.plan.codigo)),
      renderTableRow("ID plan", escapeHtml(data.plan.id)),
      renderTableRow("Isapre plan", escapeHtml(data.plan.isapre)),
      renderTableRow("Precio UF", escapeHtml(data.plan.precioUf)),
      renderTableRow("Precio CLP", escapeHtml(data.plan.precioClp)),
      renderTableRow(
        "Cobertura hospitalaria",
        escapeHtml(`${data.plan.coberturaHospitalaria}%`),
      ),
      renderTableRow(
        "Cobertura ambulatoria",
        escapeHtml(`${data.plan.coberturaAmbulatoria}%`),
      ),
    );
  }

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#222;">Nueva cotización recibida</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">${escapeHtml(timestamp)} (America/Santiago)</p>
    ${planBlock}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
      ${rows.join("")}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#666;word-break:break-all;">
      Enlace al cotizador:<br />
      <a href="${escapeHtml(data.cotizadorUrl)}" style="color:${BRAND_COLOR};">${escapeHtml(data.cotizadorUrl)}</a>
    </p>
    ${renderButton("Abrir cotización", data.cotizadorUrl)}
  `;

  return emailShell(buildAdminCotizacionSubject(data), body);
}
