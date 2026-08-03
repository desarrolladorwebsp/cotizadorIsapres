import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LEAD_SOURCE = "Formulario web - Cotizador Premium";
const DEFAULT_COTIZADOR_API_URL = "https://isaprespremium.cl";

type LeadBody = {
  nombreCompleto?: unknown;
  correo?: unknown;
  celular?: unknown;
  rut?: unknown;
  edad?: unknown;
  previsionActual?: unknown;
  ufActual?: unknown;
  regionResidencia?: unknown;
  cargas?: unknown;
  edadCargas?: unknown;
  rentaImponible?: unknown;
  motivo?: unknown;
  preferenciaContacto?: unknown;
  website?: unknown;
  _hp?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mapPreferenciaContacto(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "correo" || normalized === "email") return "email";
  if (normalized === "telefono" || normalized === "teléfono") return "telefono";
  if (
    normalized === "video_llamada" ||
    normalized === "video-llamada" ||
    normalized === "zoom"
  ) {
    return "video-llamada";
  }
  if (normalized === "whatsapp") return "whatsapp";
  return normalized;
}

function normalizeOptionalRut(value: string): string | null {
  const cleaned = value.replace(/[.\s]/g, "").toUpperCase();
  if (!cleaned) return null;
  const match = cleaned.match(/^(\d{7,8})-?([\dK])$/);
  if (!match) return null;

  const body = match[1];
  const dv = match[2];
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const expectedDv =
    expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  if (expectedDv !== dv) return null;

  return `${body}-${dv}`;
}

function getClientsEndpoint(): string {
  const base = (
    process.env.COTIZADOR_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_ENGINE_APP_URL?.trim() ||
    DEFAULT_COTIZADOR_API_URL
  ).replace(/\/$/, "");
  return `${base}/api/public/v1/clients`;
}

function getApiSecret(): string | undefined {
  return (
    process.env.COTIZADOR_PUBLIC_API_SECRET?.trim() ||
    process.env.PUBLIC_API_SECRET?.trim() ||
    undefined
  );
}

function compactMetadata(
  input: Record<string, string | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value && value.trim()) out[key] = value.trim();
  }
  return out;
}

/** Diagnóstico: ¿CRM configurado? */
export async function GET() {
  return NextResponse.json({
    ok: true,
    crm: {
      configured: Boolean(getApiSecret()),
      apiBase: (
        process.env.COTIZADOR_API_URL?.trim() ||
        process.env.NEXT_PUBLIC_ENGINE_APP_URL?.trim() ||
        DEFAULT_COTIZADOR_API_URL
      ).replace(/\/$/, ""),
      source: LEAD_SOURCE,
    },
  });
}

/**
 * Registra el lead del formulario de asesoría en el CRM del cotizador
 * (POST /api/public/v1/clients) y solicita aviso interno con CC a premiumisapres.
 */
export async function POST(request: Request) {
  try {
    let body: LeadBody;
    try {
      body = (await request.json()) as LeadBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Solicitud inválida." },
        { status: 400 },
      );
    }

    const bait = asTrimmedString(body._hp ?? body.website);
    if (bait) {
      return NextResponse.json({ ok: true, registered: false });
    }

    const fullName = asTrimmedString(body.nombreCompleto);
    const email = asTrimmedString(body.correo);
    const phone = asTrimmedString(body.celular);
    const rut = normalizeOptionalRut(asTrimmedString(body.rut));

    if (fullName.length < 2 || !email || !phone) {
      return NextResponse.json(
        { ok: false, error: "Faltan nombre, correo o teléfono." },
        { status: 400 },
      );
    }

    const secret = getApiSecret();
    if (!secret) {
      console.error(
        "[api/leads] Falta COTIZADOR_PUBLIC_API_SECRET (o PUBLIC_API_SECRET).",
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Registro CRM no configurado. Agrega COTIZADOR_PUBLIC_API_SECRET en Vercel.",
          code: "CRM_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const preferenciaContacto = mapPreferenciaContacto(
      asTrimmedString(body.preferenciaContacto),
    );
    const motivo = asTrimmedString(body.motivo);

    const payload = {
      fullName,
      email,
      phone,
      ...(rut ? { rut } : {}),
      source: LEAD_SOURCE,
      ...(preferenciaContacto ? { preferenciaContacto } : {}),
      ...(motivo ? { notes: `Motivo: ${motivo}` } : {}),
      metadata: compactMetadata({
        sitio: "Cotizador Premium",
        edad: asTrimmedString(body.edad) || undefined,
        "previsión actual": asTrimmedString(body.previsionActual) || undefined,
        "UF actuales": asTrimmedString(body.ufActual) || undefined,
        región: asTrimmedString(body.regionResidencia) || undefined,
        "cargas médicas": asTrimmedString(body.cargas) || undefined,
        "edad cargas": asTrimmedString(body.edadCargas) || undefined,
        "renta imponible": asTrimmedString(body.rentaImponible) || undefined,
      }),
      executiveKind: "ISAPRES_PREMIUM" as const,
      autoAssign: false,
      notifyAdmin: true,
    };

    const endpoint = getClientsEndpoint();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorPayload: unknown = await response.json().catch(() => null);
      console.error(
        "[api/leads] CRM error",
        response.status,
        endpoint,
        errorPayload,
      );
      return NextResponse.json(
        {
          ok: false,
          error: "No se pudo registrar la solicitud en el cotizador.",
          code: "CRM_UPSTREAM_ERROR",
          status: response.status,
        },
        { status: 502 },
      );
    }

    const result: unknown = await response.json().catch(() => null);
    return NextResponse.json({ ok: true, registered: true, result });
  } catch (error) {
    console.error("[api/leads]", error);
    return NextResponse.json(
      { ok: false, error: "Error interno al registrar la solicitud." },
      { status: 500 },
    );
  }
}
