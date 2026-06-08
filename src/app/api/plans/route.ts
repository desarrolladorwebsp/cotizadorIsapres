import { NextResponse } from "next/server";
import { readPlans, writePlans } from "@/lib/api/data-store";
import { isValidPlan, normalizePlan } from "@/lib/api/plan-validation";
import type { HealthPlan } from "@/types/plan";

export async function GET() {
  try {
    const plans = await readPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/plans", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los planes." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as unknown;

    if (!isValidPlan(payload)) {
      return NextResponse.json(
        { error: "Datos del plan inválidos." },
        { status: 400 },
      );
    }

    const plan = normalizePlan(payload);
    const plans = await readPlans();
    const exists = plans.some(
      (item) => item.unique_code === plan.unique_code,
    );

    if (exists) {
      return NextResponse.json(
        { error: "Ya existe un plan con ese código único." },
        { status: 409 },
      );
    }
    const nextPlans = [...plans, plan];
    await writePlans(nextPlans);

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans", error);
    return NextResponse.json(
      { error: "No se pudo crear el plan." },
      { status: 500 },
    );
  }
}
