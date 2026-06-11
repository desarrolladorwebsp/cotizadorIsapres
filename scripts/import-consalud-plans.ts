import { readFile } from "fs/promises";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resolveIsapreIdFromName } from "../src/lib/isapre-catalog";
import { dedupeCoverageEntries } from "../src/lib/api/plan-validation";
import type { HealthPlan } from "../src/types/plan";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function ensureClinics(plans: HealthPlan[]) {
  const clinicMap = new Map<string, string>();

  for (const plan of plans) {
    for (const entry of plan.coverage) {
      clinicMap.set(entry.clinic_id, entry.clinic_name);
    }
  }

  for (const [id, name] of clinicMap) {
    await prisma.clinic.upsert({
      where: { id },
      create: { id, name },
      update: { name },
    });
  }

  return clinicMap.size;
}

async function importPlans(plans: HealthPlan[]) {
  const existing = await prisma.plan.findMany({
    select: { uniqueCode: true },
  });
  const existingCodes = new Set(existing.map((plan) => plan.uniqueCode));

  let created = 0;
  let skipped = 0;

  for (const rawPlan of plans) {
    const plan: HealthPlan = {
      ...rawPlan,
      coverage: dedupeCoverageEntries(rawPlan.coverage),
    };

    if (existingCodes.has(plan.unique_code)) {
      skipped += 1;
      continue;
    }

    const isapreId = resolveIsapreIdFromName(plan.isapre);

    await prisma.isapre.upsert({
      where: { id: isapreId },
      create: { id: isapreId, name: plan.isapre },
      update: { name: plan.isapre },
    });

    await prisma.plan.create({
      data: {
        uniqueCode: plan.unique_code,
        isapreId,
        planName: plan.plan_name,
        basePriceUf: plan.base_price_uf,
        hasTop: plan.has_top,
        additionalNotes: plan.additional_notes,
        pdfUrl: plan.pdf_url,
        pdfPublicId: plan.pdf_public_id,
        coverages: {
          create: plan.coverage.map((entry) => ({
            clinicId: entry.clinic_id,
            clinicName: entry.clinic_name,
            percentage: entry.percentage,
            type: entry.type,
          })),
        },
      },
    });

    existingCodes.add(plan.unique_code);
    created += 1;
  }

  return { created, skipped };
}

async function main() {
  const parsedPath = process.argv[2];
  const sourceLabel = process.argv[3] ?? "Consalud";

  if (!parsedPath) {
    console.error(
      "Uso: npx tsx scripts/import-consalud-plans.ts <ruta-json> [etiqueta]",
    );
    process.exit(1);
  }

  const raw = await readFile(path.resolve(parsedPath), "utf-8");
  const plans = JSON.parse(raw) as HealthPlan[];

  const clinicCount = await ensureClinics(plans);
  const { created, skipped } = await importPlans(plans);
  const total = await prisma.plan.count();

  console.log(`Importación ${sourceLabel} completada:`);
  console.log(`  - ${plans.length} planes en archivo`);
  console.log(`  - ${created} planes creados`);
  console.log(`  - ${skipped} planes omitidos (ya existían)`);
  console.log(`  - ${clinicCount} clínicas aseguradas en este lote`);
  console.log(`  - ${total} planes totales en BD`);
}

main()
  .catch((error) => {
    console.error("Error en importación:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
