import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { buildPlanPdfStorageKey } from "../src/lib/plan-pdf-storage/paths";
import { savePlanPdf } from "../src/lib/plan-pdf-storage/upload";
import {
  assertBlobConfigured,
  resolvePlanPdfStorageBackend,
  useVercelBlobStorage,
} from "../src/lib/plan-pdf-storage/provider";
import { isVercelBlobUrl } from "../src/lib/plan-pdf-storage/blob";
import { resolveIsapreNameFromId } from "../src/lib/isapre-catalog";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

interface PdfCandidate {
  absolutePath: string;
  uniqueCode: string;
  isapre: string | null;
}

async function collectPdfFiles(rootDir: string): Promise<PdfCandidate[]> {
  const results: PdfCandidate[] = [];

  async function walk(currentDir: string, isapreFolder: string | null) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        const nextIsapre = isapreFolder ?? entry.name;
        await walk(absolutePath, nextIsapre);
        continue;
      }

      if (!entry.name.toLowerCase().endsWith(".pdf")) continue;

      const uniqueCode = entry.name.replace(/\.pdf$/i, "");
      results.push({
        absolutePath,
        uniqueCode,
        isapre: isapreFolder,
      });
    }
  }

  await walk(rootDir, null);
  return results;
}

function planPdfAlreadySynced(
  plan: { pdfUrl: string | null; pdfPublicId: string | null },
  storageKey: string,
): boolean {
  if (plan.pdfPublicId !== storageKey) return false;
  if (!plan.pdfUrl) return false;

  if (useVercelBlobStorage()) {
    return isVercelBlobUrl(plan.pdfUrl);
  }

  return plan.pdfUrl.includes("/api/plans/");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const sourceArg = process.argv
    .slice(2)
    .find((arg) => !arg.startsWith("--"));
  const sourceDir = path.resolve(
    sourceArg ?? path.join(process.cwd(), "storage", "planes-pdf"),
  );
  const backend = resolvePlanPdfStorageBackend();

  if (backend === "blob") {
    assertBlobConfigured();
  }

  const sourceStats = await stat(sourceDir).catch(() => null);
  if (!sourceStats?.isDirectory()) {
    console.error(`Carpeta no encontrada: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`Backend: ${backend}`);
  console.log(`Origen: ${sourceDir}`);
  if (dryRun) console.log("Modo dry-run (sin subir ni escribir BD)");

  const files = await collectPdfFiles(sourceDir);
  console.log(`PDFs encontrados: ${files.length}`);

  let uploaded = 0;
  let skipped = 0;
  let missingPlan = 0;
  let errors = 0;

  for (const file of files) {
    const plan = await prisma.plan.findFirst({
      where: {
        uniqueCode: {
          equals: file.uniqueCode,
          mode: "insensitive",
        },
      },
    });

    if (!plan) {
      missingPlan += 1;
      console.warn(`  [omitido] Plan no existe en BD: ${file.uniqueCode}`);
      continue;
    }

    const isapreName = resolveIsapreNameFromId(plan.isapreId);
    const storageKey = buildPlanPdfStorageKey(isapreName, plan.uniqueCode);

    if (planPdfAlreadySynced(plan, storageKey)) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] ${plan.uniqueCode} → ${storageKey}`);
      uploaded += 1;
      continue;
    }

    try {
      const fileBuffer = await readFile(file.absolutePath);
      const result = await savePlanPdf({
        fileBuffer,
        isapre: isapreName,
        uniqueCode: plan.uniqueCode,
        mimeType: "application/pdf",
        previousStoragePath: plan.pdfPublicId,
      });

      await prisma.plan.update({
        where: { uniqueCode: plan.uniqueCode },
        data: {
          pdfUrl: result.url,
          pdfPublicId: result.storagePath,
        },
      });

      uploaded += 1;
      console.log(`  [ok] ${plan.uniqueCode} (${result.backend}) → ${result.storagePath}`);
    } catch (error) {
      errors += 1;
      console.error(`  [error] ${file.uniqueCode}:`, error);
    }
  }

  console.log("\nResumen:");
  console.log(`  - Subidos/actualizados: ${uploaded}`);
  console.log(`  - Ya sincronizados: ${skipped}`);
  console.log(`  - Sin plan en BD: ${missingPlan}`);
  console.log(`  - Errores: ${errors}`);
}

main()
  .catch((error) => {
    console.error("Error en carga masiva:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
