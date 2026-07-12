import { escapeHtml } from "@/lib/email/escape-html";
import type { CotizacionNotifyInput } from "@/lib/email/cotizacion-notify-schema";
import {
  buildEmailShell,
  renderEmailButton,
  renderHighlightBox,
  resolveAgentEmailBrand,
  resolvePremiumEmailBrand,
} from "@/lib/email/email-branding";

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

function formatBoolean(value: boolean | undefined): string {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
}

function renderTableRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;font-size:14px;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#222;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;
}

function resolveUserBrand(data: CotizacionNotifyInput) {
  return resolveAgentEmailBrand({
    partnerEntityName: data.partnerEntityName,
    partnerEntitySlug: data.partnerEntitySlug,
    partnerEntityTheme: data.partnerEntityTheme,
    partnerEntityLogoUrl: data.partnerEntityLogoUrl,
  });
}

function buildPlanHighlightLines(
  data: CotizacionNotifyInput,
): string[] | null {
  if (!data.plan) return null;

  const lines = [
    `${escapeHtml(data.plan.codigo)} · ${escapeHtml(data.plan.isapre)}`,
    escapeHtml(data.plan.nombre),
    `${escapeHtml(data.plan.precioUf)} · ${escapeHtml(data.plan.precioClp)}`,
  ];

  if (data.plan.tipoPlan) {
    lines.push(`Tipo: ${escapeHtml(data.plan.tipoPlan)}`);
  }

  return lines;
}

export function buildUserCotizacionSubject(data: CotizacionNotifyInput): string {
  const brand = resolveUserBrand(data);
  if (data.plan?.codigo) {
    return `Tu solicitud de plan ${data.plan.codigo} — ${brand.name}`;
  }
  return `Tu cotización de Isapre — ${brand.name}`;
}

export function buildUserCotizacionEmailHtml(
  data: CotizacionNotifyInput,
): string {
  const brand = resolveUserBrand(data);
  const planHighlight = buildPlanHighlightLines(data);

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

  const planSection = planHighlight
    ? renderHighlightBox(brand, "Plan solicitado", planHighlight)
    : "";

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#222;">Tu cotización de Isapre</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#444;">
      Recibimos tu solicitud en <strong>${escapeHtml(brand.name)}</strong>. Este es un resumen de los datos que enviaste:
    </p>
    ${planSection}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
      ${rows}
    </table>
    ${renderEmailButton(brand, "Ver mi cotización", data.cotizadorUrl)}
  `;

  return buildEmailShell(
    brand,
    buildUserCotizacionSubject(data),
    body,
    `Este correo fue enviado por ${escapeHtml(brand.name)}. Si no solicitaste esta cotización, puedes ignorarlo.`,
  );
}

export function buildAdminCotizacionSubject(
  data: CotizacionNotifyInput,
): string {
  const agentLabel = data.partnerEntityName ?? data.partnerEntitySlug;
  if (data.plan?.codigo) {
    const suffix = agentLabel ? ` · ${agentLabel}` : "";
    return `Solicitud de plan — ${data.plan.codigo} — ${data.plan.isapre} — ${data.email}${suffix}`;
  }
  if (data.busqueda?.trim()) {
    return `Nueva cotización — ${data.busqueda.trim()} — ${data.email}`;
  }
  return `Nueva cotización — ${data.email}`;
}

function buildAdminPlanRows(data: CotizacionNotifyInput): string[] {
  if (!data.plan) return [];

  const rows = [
    renderTableRow("Código plan", escapeHtml(data.plan.codigo)),
    renderTableRow("ID plan", escapeHtml(data.plan.id)),
    renderTableRow("Nombre comercial", escapeHtml(data.plan.nombre)),
    renderTableRow("Isapre", escapeHtml(data.plan.isapre)),
    renderTableRow("Tipo de plan", escapeHtml(data.plan.tipoPlan ?? "—")),
    renderTableRow("Precio final UF", escapeHtml(data.plan.precioUf)),
    renderTableRow("Precio final CLP", escapeHtml(data.plan.precioClp)),
    renderTableRow("Precio base UF", escapeHtml(data.plan.precioBaseUf ?? "—")),
    renderTableRow("GES por beneficiario", escapeHtml(data.plan.gesPremiumUf ?? "—")),
    renderTableRow("Plan TOP", escapeHtml(formatBoolean(data.plan.tieneTop))),
    renderTableRow(
      "Cobertura hospitalaria",
      escapeHtml(`${data.plan.coberturaHospitalaria}%`),
    ),
    renderTableRow(
      "Cobertura ambulatoria",
      escapeHtml(`${data.plan.coberturaAmbulatoria}%`),
    ),
    renderTableRow(
      "Clínicas en red",
      escapeHtml(
        data.plan.clinicas !== undefined ? String(data.plan.clinicas) : "—",
      ),
    ),
    renderTableRow(
      "Total beneficiarios",
      escapeHtml(
        data.plan.totalBeneficiarios !== undefined
          ? String(data.plan.totalBeneficiarios)
          : "—",
      ),
    ),
    renderTableRow(
      "Factores de riesgo",
      escapeHtml(
        data.plan.factoresRiesgo !== undefined
          ? String(data.plan.factoresRiesgo)
          : "—",
      ),
    ),
    renderTableRow("Notas del plan", escapeHtml(data.plan.notas ?? "—")),
  ];

  if (data.plan.pdfUrl) {
    rows.push(
      renderTableRow(
        "PDF del plan",
        `<a href="${escapeHtml(data.plan.pdfUrl)}" style="color:${resolvePremiumEmailBrand().primary};">Descargar PDF</a>`,
      ),
    );
  }

  return rows;
}

export function buildAdminCotizacionEmailHtml(
  data: CotizacionNotifyInput,
): string {
  const brand = resolvePremiumEmailBrand();
  const timestamp = new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  const planHighlight = buildPlanHighlightLines(data);
  const planBlock = planHighlight
    ? renderHighlightBox(brand, "Plan solicitado", planHighlight)
    : "";

  const solicitanteRows = data.solicitante
    ? [
        renderTableRow("Nombre", escapeHtml(data.solicitante.nombre)),
        renderTableRow("RUT", escapeHtml(data.solicitante.rut ?? "—")),
        renderTableRow("Teléfono", escapeHtml(data.solicitante.telefono ?? "—")),
        ...(data.solicitante.isapreActual
          ? [
              renderTableRow(
                "Isapre actual",
                escapeHtml(data.solicitante.isapreActual),
              ),
            ]
          : []),
        ...(data.solicitante.notas
          ? [renderTableRow("Notas", escapeHtml(data.solicitante.notas))]
          : []),
      ]
    : [];

  const rows = [
    renderTableRow("Correo del usuario", escapeHtml(data.email)),
    ...solicitanteRows,
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
      "Agente / widget",
      escapeHtml(data.partnerEntityName ?? data.partnerEntitySlug ?? "Cotizador Premium"),
    ),
    renderTableRow(
      "Slug del agente",
      escapeHtml(data.partnerEntitySlug ?? "cotizadorpremium"),
    ),
    ...buildAdminPlanRows(data),
  ];

  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;color:#222;">Nueva cotización recibida</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666;">${escapeHtml(timestamp)} (America/Santiago)</p>
    ${planBlock}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
      ${rows.join("")}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#666;word-break:break-all;">
      Enlace al cotizador:<br />
      <a href="${escapeHtml(data.cotizadorUrl)}" style="color:${brand.primary};">${escapeHtml(data.cotizadorUrl)}</a>
    </p>
    ${renderEmailButton(brand, "Abrir cotización", data.cotizadorUrl)}
  `;

  return buildEmailShell(
    brand,
    buildAdminCotizacionSubject(data),
    body,
    `Alerta interna de ${escapeHtml(brand.name)}. Responde al usuario desde el panel de ejecutivos.`,
  );
}
