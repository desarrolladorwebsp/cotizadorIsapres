import { NextResponse } from "next/server";
import {
  readPlanByCode,
  readPlans,
  writePlans,
} from "@/lib/api/data-store";
import { isValidPlan, normalizePlan } from "@/lib/api/plan-validation";
import { deletePlanPdf } from "@/lib/cloudinary/delete-plan-pdf";
import { isCloudinaryConfigured } from "@/lib/cloudinary/env";
import type { HealthPlan } from "@/types/plan";

interface RouteContext {
  params: Promise<{ uniqueCode: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { uniqueCode } = await context.params;
    const plan = await readPlanByCode(decodeURIComponent(uniqueCode));

    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("GET /api/plans/[uniqueCode]", error);
    return NextResponse.json(
      { error: "No se pudo obtener el plan." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { uniqueCode } = await context.params;
    const decodedCode = decodeURIComponent(uniqueCode);
    const payload = (await request.json()) as unknown;

    if (!isValidPlan(payload)) {
      return NextResponse.json(
        { error: "Datos del plan inválidos." },
        { status: 400 },
      );
    }

    const plan = normalizePlan(payload);

    if (plan.unique_code !== decodedCode) {
      return NextResponse.json(
        { error: "El código único de la URL no coincide con el del cuerpo." },
        { status: 400 },
      );
    }

    const plans = await readPlans();
    const index = plans.findIndex((plan) => plan.unique_code === decodedCode);

    if (index === -1) {
      return NextResponse.json(
        { error: "Plan no encontrado." },
        { status: 404 },
      );
    }

    const nextPlans = [...plans];
    nextPlans[index] = plan;
    await writePlans(nextPlans);

    return NextResponse.json(plan);
  } catch (error) {
    console.error("PUT /api/plans/[uniqueCode]", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el plan." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { uniqueCode } = await context.params;
    const decodedCode = decodeURIComponent(uniqueCode);
    const plans = await readPlans();
    const planToDelete = plans.find((plan) => plan.unique_code === decodedCode);

    if (!planToDelete) {
      return NextResponse.json(
        { error: "Plan no encontrado." },
        { status: 404 },
      );
    }

    const nextPlans = plans.filter(
      (plan) => plan.unique_code !== decodedCode,
    );

    await writePlans(nextPlans);

    if (
      isCloudinaryConfigured() &&
      planToDelete.pdf_public_id?.trim()
    ) {
      try {
        await deletePlanPdf(planToDelete.pdf_public_id);
      } catch (error) {
        console.warn("No se pudo eliminar el PDF en Cloudinary:", error);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/plans/[uniqueCode]", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el plan." },
      { status: 500 },
    );
  }
}
