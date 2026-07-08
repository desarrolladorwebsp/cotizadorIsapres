import { Prisma } from "@prisma/client";
import { dedupeCoverageEntries } from "@/lib/api/plan-validation";
import {
  mapDbPlanToHealthPlan,
  mapDbPlanToHealthPlanLegacy,
  type PlanWithCoverages,
} from "@/lib/api/plan-mapper";
import { resolveIsapreIdFromName } from "@/lib/isapre-catalog";
import {
  DEFAULT_GES_PREMIUM_UF,
  ISAPRE_GES_DEFAULTS,
  resolveGesPremiumUf,
} from "@/lib/isapre-ges-defaults";
import { enrichHealthPlanCatalog } from "@/lib/plan-zones";
import { prisma } from "@/lib/prisma";
import type { CoverageEntry, HealthPlan } from "@/types/plan";

const planIncludeFull = { coverages: true, isapreRef: true } as const;
const planIncludeLegacy = { coverages: true } as const;

type PlanQueryStrategy =
  | "prisma_full"
  | "prisma_coverages"
  | "raw_modern"
  | "raw_legacy";

let activeStrategy: PlanQueryStrategy | null = null;

function resolveGesPremiumForIsapreId(isapreId: string): number {
  const defaults = ISAPRE_GES_DEFAULTS[isapreId];
  return resolveGesPremiumUf(
    defaults?.gesPremiumUf,
    DEFAULT_GES_PREMIUM_UF,
  );
}

function isSchemaMismatchError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2022" || error.code === "P2021";
  }

  return error instanceof Prisma.PrismaClientValidationError;
}

type RawCoverageRow = {
  plan_code: string;
  clinic_id: string;
  clinic_name: string;
  percentage: number;
  type: string;
};

async function loadCoveragesByPlanCode(): Promise<
  Map<string, CoverageEntry[]>
> {
  const rows = await prisma.$queryRaw<RawCoverageRow[]>`
    SELECT plan_code, clinic_id, clinic_name, percentage, type
    FROM coverage_entries
  `;

  const map = new Map<string, CoverageEntry[]>();

  for (const row of rows) {
    const entries = map.get(row.plan_code) ?? [];
    entries.push({
      clinic_id: row.clinic_id,
      clinic_name: row.clinic_name,
      percentage: row.percentage,
      type: row.type as CoverageEntry["type"],
    });
    map.set(row.plan_code, entries);
  }

  return map;
}

function mapCoverageMap(
  uniqueCode: string,
  coverages: Map<string, CoverageEntry[]>,
): CoverageEntry[] {
  return dedupeCoverageEntries(coverages.get(uniqueCode) ?? []);
}

type RawModernPlanRow = {
  unique_code: string;
  isapre_id: string;
  plan_name: string;
  base_price_uf: number;
  has_top: boolean;
  additional_notes: string | null;
  pdf_url: string | null;
  pdf_public_id: string | null;
  zones: string[];
  isapre_name: string;
};

async function findManyHealthPlansRawModern(): Promise<HealthPlan[]> {
  const [planRows, coverages] = await Promise.all([
    prisma.$queryRaw<RawModernPlanRow[]>`
      SELECT
        p.unique_code,
        p.isapre_id,
        p.plan_name,
        p.base_price_uf,
        p.has_top,
        p.additional_notes,
        p.pdf_url,
        p.pdf_public_id,
        p.zones,
        i.name AS isapre_name
      FROM plans p
      INNER JOIN isapres i ON i.id = p.isapre_id
      ORDER BY p.plan_name ASC
    `,
    loadCoveragesByPlanCode(),
  ]);

  return planRows.map((plan) => ({
    isapre: plan.isapre_name,
    plan_name: plan.plan_name,
    unique_code: plan.unique_code,
    base_price_uf: plan.base_price_uf,
    ges_premium_uf: resolveGesPremiumForIsapreId(plan.isapre_id),
    has_top: plan.has_top,
    additional_notes: plan.additional_notes,
    pdf_url: plan.pdf_url,
    pdf_public_id: plan.pdf_public_id,
    zones: plan.zones ?? [],
    coverage: mapCoverageMap(plan.unique_code, coverages),
  }));
}

async function findHealthPlanByCodeRawModern(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  const [planRows, coverages] = await Promise.all([
    prisma.$queryRaw<RawModernPlanRow[]>`
      SELECT
        p.unique_code,
        p.isapre_id,
        p.plan_name,
        p.base_price_uf,
        p.has_top,
        p.additional_notes,
        p.pdf_url,
        p.pdf_public_id,
        p.zones,
        i.name AS isapre_name
      FROM plans p
      INNER JOIN isapres i ON i.id = p.isapre_id
      WHERE p.unique_code = ${uniqueCode}
      LIMIT 1
    `,
    loadCoveragesByPlanCode(),
  ]);

  const plan = planRows[0];
  if (!plan) return null;

  return {
    isapre: plan.isapre_name,
    plan_name: plan.plan_name,
    unique_code: plan.unique_code,
    base_price_uf: plan.base_price_uf,
    ges_premium_uf: resolveGesPremiumForIsapreId(plan.isapre_id),
    has_top: plan.has_top,
    additional_notes: plan.additional_notes,
    pdf_url: plan.pdf_url,
    pdf_public_id: plan.pdf_public_id,
    zones: plan.zones ?? [],
    coverage: mapCoverageMap(plan.unique_code, coverages),
  };
}

type RawLegacyPlanRow = {
  unique_code: string;
  isapre: string;
  plan_name: string;
  base_price_uf: number;
  has_top: boolean;
  additional_notes: string | null;
  pdf_url: string | null;
  pdf_public_id: string | null;
  zones: string[];
};

async function findManyHealthPlansRawLegacy(): Promise<HealthPlan[]> {
  const [planRows, coverages] = await Promise.all([
    prisma.$queryRaw<RawLegacyPlanRow[]>`
      SELECT
        unique_code,
        isapre,
        plan_name,
        base_price_uf,
        has_top,
        additional_notes,
        pdf_url,
        pdf_public_id,
        zones
      FROM plans
      ORDER BY plan_name ASC
    `,
    loadCoveragesByPlanCode(),
  ]);

  return planRows.map((plan) => {
    const isapreId = resolveIsapreIdFromName(plan.isapre);

    return {
      isapre: plan.isapre,
      plan_name: plan.plan_name,
      unique_code: plan.unique_code,
      base_price_uf: plan.base_price_uf,
      ges_premium_uf: resolveGesPremiumForIsapreId(isapreId),
      has_top: plan.has_top,
      additional_notes: plan.additional_notes,
      pdf_url: plan.pdf_url,
      pdf_public_id: plan.pdf_public_id,
      zones: plan.zones ?? [],
      coverage: mapCoverageMap(plan.unique_code, coverages),
    };
  });
}

async function findHealthPlanByCodeRawLegacy(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  const [planRows, coverages] = await Promise.all([
    prisma.$queryRaw<RawLegacyPlanRow[]>`
      SELECT
        unique_code,
        isapre,
        plan_name,
        base_price_uf,
        has_top,
        additional_notes,
        pdf_url,
        pdf_public_id,
        zones
      FROM plans
      WHERE unique_code = ${uniqueCode}
      LIMIT 1
    `,
    loadCoveragesByPlanCode(),
  ]);

  const plan = planRows[0];
  if (!plan) return null;

  const isapreId = resolveIsapreIdFromName(plan.isapre);

  return {
    isapre: plan.isapre,
    plan_name: plan.plan_name,
    unique_code: plan.unique_code,
    base_price_uf: plan.base_price_uf,
    ges_premium_uf: resolveGesPremiumForIsapreId(isapreId),
    has_top: plan.has_top,
    additional_notes: plan.additional_notes,
    pdf_url: plan.pdf_url,
    pdf_public_id: plan.pdf_public_id,
    zones: plan.zones ?? [],
    coverage: mapCoverageMap(plan.unique_code, coverages),
  };
}

async function findManyWithPrismaFull(): Promise<HealthPlan[]> {
  const plans = await prisma.plan.findMany({
    include: planIncludeFull,
    orderBy: { planName: "asc" },
  });

  return (plans as PlanWithCoverages[]).map(mapDbPlanToHealthPlan);
}

async function findManyWithPrismaCoverages(): Promise<HealthPlan[]> {
  const plans = await prisma.plan.findMany({
    include: planIncludeLegacy,
    orderBy: { planName: "asc" },
  });

  return plans.map(mapDbPlanToHealthPlanLegacy);
}

async function findHealthPlanWithPrismaFull(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  const plan = await prisma.plan.findUnique({
    where: { uniqueCode },
    include: planIncludeFull,
  });

  return plan ? mapDbPlanToHealthPlan(plan as PlanWithCoverages) : null;
}

async function findHealthPlanWithPrismaCoverages(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  const plan = await prisma.plan.findUnique({
    where: { uniqueCode },
    include: planIncludeLegacy,
  });

  return plan ? mapDbPlanToHealthPlanLegacy(plan) : null;
}

async function runPlanQueryStrategies<T>(
  loaders: Array<{ strategy: PlanQueryStrategy; load: () => Promise<T> }>,
): Promise<T> {
  const ordered =
    activeStrategy === null
      ? loaders
      : [
          ...loaders.filter((item) => item.strategy === activeStrategy),
          ...loaders.filter((item) => item.strategy !== activeStrategy),
        ];

  let lastError: unknown;

  for (const { strategy, load } of ordered) {
    try {
      const result = await load();
      activeStrategy = strategy;
      return result;
    } catch (error) {
      lastError = error;

      if (!isSchemaMismatchError(error)) {
        throw error;
      }

      console.warn(
        `[plan-query] Estrategia ${strategy} falló por esquema; probando alternativa.`,
        error,
      );
    }
  }

  throw lastError ?? new Error("No se pudo cargar el catálogo de planes.");
}

export async function findManyHealthPlans(): Promise<HealthPlan[]> {
  const plans = await runPlanQueryStrategies([
    { strategy: "prisma_full", load: findManyWithPrismaFull },
    { strategy: "prisma_coverages", load: findManyWithPrismaCoverages },
    { strategy: "raw_modern", load: findManyHealthPlansRawModern },
    { strategy: "raw_legacy", load: findManyHealthPlansRawLegacy },
  ]);

  return enrichHealthPlanCatalog(plans);
}

export async function findHealthPlanByCode(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  return runPlanQueryStrategies([
    {
      strategy: "prisma_full",
      load: () => findHealthPlanWithPrismaFull(uniqueCode),
    },
    {
      strategy: "prisma_coverages",
      load: () => findHealthPlanWithPrismaCoverages(uniqueCode),
    },
    {
      strategy: "raw_modern",
      load: () => findHealthPlanByCodeRawModern(uniqueCode),
    },
    {
      strategy: "raw_legacy",
      load: () => findHealthPlanByCodeRawLegacy(uniqueCode),
    },
  ]);
}
