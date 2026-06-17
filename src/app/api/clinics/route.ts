import { NextResponse } from "next/server";
import { readClinics, writeClinics } from "@/lib/api/data-store";
import type { Clinic } from "@/types/clinic";
import { requireAdminSession, requireStaffSession } from "@/lib/auth/require-auth";
import { apiErrorResponse } from "@/lib/api/api-error";

function isValidClinic(payload: unknown): payload is Clinic {
  if (!payload || typeof payload !== "object") return false;
  const clinic = payload as Clinic;
  return (
    typeof clinic.id === "string" &&
    clinic.id.trim().length > 0 &&
    typeof clinic.name === "string" &&
    clinic.name.trim().length > 0
  );
}

export async function GET(request: Request) {
  try {
    await requireStaffSession(request);
    const clinics = await readClinics();
    return NextResponse.json(clinics);
  } catch (error) {
    console.error("GET /api/clinics", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);
    const payload = (await request.json()) as unknown;

    if (!isValidClinic(payload)) {
      return NextResponse.json(
        { error: "Datos de la clínica inválidos." },
        { status: 400 },
      );
    }

    const clinics = await readClinics();
    const exists = clinics.some((clinic) => clinic.id === payload.id);

    if (exists) {
      return NextResponse.json(
        { error: "Ya existe una clínica con ese identificador." },
        { status: 409 },
      );
    }

    const nextClinics = [...clinics, payload];
    await writeClinics(nextClinics);

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("POST /api/clinics", error);
    return NextResponse.json(
      { error: "No se pudo crear la clínica." },
      { status: 500 },
    );
  }
}
