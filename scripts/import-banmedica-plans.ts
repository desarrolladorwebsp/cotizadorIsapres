import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const banmedicaDir = path.join(rootDir, "storage", "planes-pdf", "banmedica");
const parsedJson = path.join(rootDir, "scripts", ".banmedica-plans-parsed.json");
const santiagoXlsx = path.join(banmedicaDir, "Planes Banmedica Santiago.xlsx");
const regionesXlsx = path.join(banmedicaDir, "Planes Banmedica Regiones.xlsx");
const santiagoPdfs = path.join(banmedicaDir, "Planes PDF Santiago");

function run(command: string) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd: rootDir, stdio: "inherit" });
}

run(
  `python3 scripts/parse-banmedica-excel.py "${santiagoXlsx}" "${regionesXlsx}" "${parsedJson}"`,
);
run(`npx tsx scripts/sync-consalud-plans.ts "${parsedJson}" Banmédica`);
run(`npx tsx scripts/upload-plan-pdfs.ts "${santiagoPdfs}"`);

console.log("\nImportación Banmédica finalizada.");
