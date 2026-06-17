import { NextResponse } from "next/server";
import {
  apiErrorResponse,
  parseJsonBody,
} from "@/lib/api/api-error";
import {
  createPlanRecord,
  readPlans,
} from "@/lib/api/data-store";
import {
  getPlanValidationError,
  isValidPlan,
  normalizePlan,
} from "@/lib/api/plan-validation";
import { requireAdminSession, requireStaffSession } from "@/lib/auth/require-auth";

export async function GET(request: Request) {
  try {
    await requireStaffSession(request);
    const plans = await readPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/plans", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession(request);
    const payload = await parseJsonBody(request);

    const validationError = getPlanValidationError(payload);
    if (!isValidPlan(payload)) {
      return NextResponse.json(
        { error: validationError ?? "Datos del plan inválidos." },
        { status: 400 },
      );
    }

    const plan = normalizePlan(payload);
    const created = await createPlanRecord(plan);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/plans", error);
    const { body, status } = apiErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
