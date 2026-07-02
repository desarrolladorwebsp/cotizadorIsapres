import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { ISAPRE_CATALOG } from "../src/lib/isapre-catalog";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

interface IsapreSummaryRow {
  isapre_id: string;
  isapre: string;
  total_planes: number;
  con_pdf: number;
  sin_pdf: number;
  pct_pdf: number;
  con_cobertura: number;
  sin_cobertura: number;
  codigos_sin_pdf: string;
}

interface MissingPlanRow {
  isapre_id: string;
  isapre: string;
  unique_code: string;
  plan_name: string;
  base_price_uf: number;
  coverage_count: number;
  zones: string;
  has_top: boolean;
}

async function main() {
  const [isapres, plans] = await Promise.all([
    prisma.isapre.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.plan.findMany({
      select: {
        uniqueCode: true,
        planName: true,
        basePriceUf: true,
        hasTop: true,
        pdfUrl: true,
        zones: true,
        isapreId: true,
        isapreRef: { select: { name: true } },
        _count: { select: { coverages: true } },
      },
      orderBy: [{ isapreId: "asc" }, { uniqueCode: "asc" }],
    }),
  ]);

  const catalogNames = new Map(ISAPRE_CATALOG.map((item) => [item.id, item.name]));
  const isapreRows = new Map<string, { id: string; name: string }>();

  for (const item of ISAPRE_CATALOG) {
    isapreRows.set(item.id, { id: item.id, name: item.name });
  }
  for (const isapre of isapres) {
    isapreRows.set(isapre.id, { id: isapre.id, name: isapre.name });
  }

  const plansByIsapre = new Map<string, typeof plans>();
  for (const plan of plans) {
    const bucket = plansByIsapre.get(plan.isapreId) ?? [];
    bucket.push(plan);
    plansByIsapre.set(plan.isapreId, bucket);
  }

  const missingPlans: MissingPlanRow[] = plans
    .filter((plan) => !plan.pdfUrl)
    .map((plan) => ({
      isapre_id: plan.isapreId,
      isapre: plan.isapreRef.name,
      unique_code: plan.uniqueCode,
      plan_name: plan.planName,
      base_price_uf: plan.basePriceUf,
      coverage_count: plan._count.coverages,
      zones: plan.zones.join(", "),
      has_top: plan.hasTop,
    }));

  const missingByIsapre = new Map<string, string[]>();
  for (const row of missingPlans) {
    const codes = missingByIsapre.get(row.isapre_id) ?? [];
    codes.push(row.unique_code);
    missingByIsapre.set(row.isapre_id, codes);
  }

  const summaryAllIsapres: IsapreSummaryRow[] = [...isapreRows.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((isapre) => {
      const isaprePlans = plansByIsapre.get(isapre.id) ?? [];
      const conPdf = isaprePlans.filter((plan) => plan.pdfUrl).length;
      const sinPdf = isaprePlans.length - conPdf;
      const conCobertura = isaprePlans.filter(
        (plan) => plan._count.coverages > 0,
      ).length;
      const codes = missingByIsapre.get(isapre.id) ?? [];

      return {
        isapre_id: isapre.id,
        isapre: catalogNames.get(isapre.id) ?? isapre.name,
        total_planes: isaprePlans.length,
        con_pdf: conPdf,
        sin_pdf: sinPdf,
        pct_pdf:
          isaprePlans.length > 0
            ? Math.round((conPdf / isaprePlans.length) * 1000) / 10
            : 0,
        con_cobertura: conCobertura,
        sin_cobertura: isaprePlans.length - conCobertura,
        codigos_sin_pdf: codes.join(", "),
      };
    });

  const reportDir = path.join(process.cwd(), "storage", "reportes");
  await mkdir(reportDir, { recursive: true });

  const statusJson = path.join(reportDir, ".all-isapres-status.json");
  const missingJson = path.join(reportDir, ".missing-plan-pdfs.json");
  const statusXlsx = path.join(reportDir, "planes-estado-por-isapre.xlsx");
  const missingXlsx = path.join(reportDir, "planes-sin-pdf-por-isapre.xlsx");

  await writeFile(statusJson, JSON.stringify(summaryAllIsapres, null, 2), "utf-8");
  await writeFile(missingJson, JSON.stringify(missingPlans, null, 2), "utf-8");

  execSync(
    `python3 scripts/build-all-isapres-status-xlsx.py "${statusJson}" "${statusXlsx}"`,
    { cwd: process.cwd(), stdio: "inherit" },
  );
  execSync(
    `python3 scripts/build-missing-pdfs-xlsx.py "${missingJson}" "${missingXlsx}" "${statusJson}"`,
    { cwd: process.cwd(), stdio: "inherit" },
  );

  const totals = {
    isapres: summaryAllIsapres.length,
    planes: plans.length,
    conPdf: plans.filter((plan) => plan.pdfUrl).length,
    sinPdf: missingPlans.length,
  };

  console.log("\nReportes generados:");
  console.log("  1.", statusXlsx);
  console.log("  2.", missingXlsx);
  console.log("\nTotales:", totals);
  console.log("\nPor isapre:");
  for (const row of summaryAllIsapres) {
    console.log(
      `  - ${row.isapre}: ${row.total_planes} planes | ${row.con_pdf} PDF | ${row.sin_pdf} faltantes`,
    );
  }
}

main()
  .catch((error) => {
    console.error("Error al exportar reportes:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
