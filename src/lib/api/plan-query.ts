import { Prisma } from "@prisma/client";
import {
  mapDbPlanToHealthPlan,
  mapDbPlanToHealthPlanLegacy,
  type PlanWithCoverages,
} from "@/lib/api/plan-mapper";
import { prisma } from "@/lib/prisma";
import type { HealthPlan } from "@/types/plan";

const planIncludeFull = { coverages: true, isapreRef: true } as const;
const planIncludeLegacy = { coverages: true } as const;

let preferLegacyPlanQuery = false;

function isMissingSchemaColumnError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2022" || error.code === "P2021")
  );
}

async function findManyHealthPlansLegacy(): Promise<HealthPlan[]> {
  const plans = await prisma.plan.findMany({
    include: planIncludeLegacy,
    orderBy: { planName: "asc" },
  });

  return plans.map(mapDbPlanToHealthPlanLegacy);
}

export async function findManyHealthPlans(): Promise<HealthPlan[]> {
  if (preferLegacyPlanQuery) {
    return findManyHealthPlansLegacy();
  }

  try {
    const plans = await prisma.plan.findMany({
      include: planIncludeFull,
      orderBy: { planName: "asc" },
    });

    return (plans as PlanWithCoverages[]).map(mapDbPlanToHealthPlan);
  } catch (error) {
    if (!isMissingSchemaColumnError(error)) {
      throw error;
    }

    preferLegacyPlanQuery = true;
    console.warn(
      "[plan-query] Esquema legacy detectado (faltan columnas en isapres). Usando GES por defecto.",
    );

    return findManyHealthPlansLegacy();
  }
}

export async function findHealthPlanByCode(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  if (preferLegacyPlanQuery) {
    const plan = await prisma.plan.findUnique({
      where: { uniqueCode },
      include: planIncludeLegacy,
    });

    return plan ? mapDbPlanToHealthPlanLegacy(plan) : null;
  }

  try {
    const plan = await prisma.plan.findUnique({
      where: { uniqueCode },
      include: planIncludeFull,
    });

    return plan ? mapDbPlanToHealthPlan(plan as PlanWithCoverages) : null;
  } catch (error) {
    if (!isMissingSchemaColumnError(error)) {
      throw error;
    }

    preferLegacyPlanQuery = true;
    console.warn(
      "[plan-query] Esquema legacy detectado (faltan columnas en isapres). Usando GES por defecto.",
    );

    const plan = await prisma.plan.findUnique({
      where: { uniqueCode },
      include: planIncludeLegacy,
    });

    return plan ? mapDbPlanToHealthPlanLegacy(plan) : null;
  }
}
