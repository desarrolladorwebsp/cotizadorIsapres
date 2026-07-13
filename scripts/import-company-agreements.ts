import path from "node:path";
import { existsSync } from "node:fs";
import { config } from "dotenv";
import * as XLSX from "xlsx";
import { isValidRut, formatRut } from "../src/lib/auth/rut";
import { COLMENA_HOLDING_AGREEMENT_ISAPRE_ID } from "../src/lib/company-agreements/constants";
import {
  normalizeCompanyAgreementName,
  normalizeCompanyAgreementRut,
  parseAgreementDiscountPercent,
} from "../src/lib/company-agreements/normalize";
import { prisma } from "../src/lib/prisma";

config({ path: path.join(process.cwd(), ".env.local") });

const DEFAULT_FILE = path.join(
  process.cwd(),
  "storage",
  "convenios",
  "colmena-holding-filiales.xls",
);
const DEFAULT_DISCOUNT_PERCENT = 10;
const DEFAULT_ISAPRE_ID = COLMENA_HOLDING_AGREEMENT_ISAPRE_ID;

type CellValue = string | number | boolean | null | undefined;

interface ParsedAgreement {
  companyRut: string;
  companyRutRaw: string;
  companyName: string;
  normalizedName: string;
  discountPercent: number | null;
  active: boolean;
}

function parseCliArgs(argv: string[]) {
  let filePath: string | undefined;
  let isapreId = DEFAULT_ISAPRE_ID;
  let discountPercent = DEFAULT_DISCOUNT_PERCENT;

  for (const arg of argv) {
    if (arg.startsWith("--isapre=")) {
      isapreId = arg.slice("--isapre=".length).trim() || DEFAULT_ISAPRE_ID;
      continue;
    }
    if (arg.startsWith("--discount=")) {
      const parsed = Number(arg.slice("--discount=".length));
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100) {
        throw new Error("El parámetro --discount debe ser un número entre 1 y 100.");
      }
      discountPercent = parsed;
      continue;
    }
    if (!arg.startsWith("-")) {
      filePath = arg;
    }
  }

  return {
    filePath: path.resolve(filePath ?? DEFAULT_FILE),
    isapreId,
    discountPercent,
  };
}

function normalizeHeader(value: CellValue): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

function cellText(value: CellValue): string {
  return String(value ?? "").trim();
}

function findColumn(headers: CellValue[], candidates: string[]): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  return normalizedHeaders.findIndex((header) =>
    candidates.some((candidate) => header.includes(candidate)),
  );
}

function findPreferredColumn(
  headers: CellValue[],
  preferred: string[],
  fallback: string[],
): number {
  const normalizedHeaders = headers.map(normalizeHeader);
  const preferredIndex = normalizedHeaders.findIndex((header) =>
    preferred.some((candidate) => header === candidate),
  );
  if (preferredIndex >= 0) return preferredIndex;
  return findColumn(headers, fallback);
}

function findHeaderRow(rows: CellValue[][]): {
  rowIndex: number;
  rutCol: number;
  nameCol: number;
  discountCol: number;
} {
  const maxScan = Math.min(rows.length, 30);

  for (let rowIndex = 0; rowIndex < maxScan; rowIndex += 1) {
    const headers = rows[rowIndex] ?? [];
    const rutCol = findPreferredColumn(headers, ["rut filial"], ["rut"]);
    const nameCol = findPreferredColumn(
      headers,
      ["nombre filial"],
      ["razon social", "razon", "empresa", "nombre", "holding"],
    );
    const discountCol = findColumn(headers, [
      "descuento",
      "%",
      "porcentaje",
      "beneficio",
    ]);

    if (rutCol >= 0 && nameCol >= 0 && nameCol !== rutCol) {
      return { rowIndex, rutCol, nameCol, discountCol };
    }
  }

  throw new Error(
    "No se encontró una fila de encabezados con columnas de RUT y empresa.",
  );
}

function parseWorkbook(
  filePath: string,
  defaultDiscountPercent: number,
): ParsedAgreement[] {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const parsed = new Map<string, ParsedAgreement>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<CellValue[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    if (rows.length === 0) continue;

    let columns: ReturnType<typeof findHeaderRow>;
    try {
      columns = findHeaderRow(rows);
    } catch {
      continue;
    }

    for (const row of rows.slice(columns.rowIndex + 1)) {
      const companyRutRaw = cellText(row[columns.rutCol]);
      const companyRut = normalizeCompanyAgreementRut(companyRutRaw);
      if (!companyRutRaw || !isValidRut(companyRut)) continue;

      const companyName = cellText(row[columns.nameCol]);
      if (!companyName) continue;

      parsed.set(companyRut, {
        companyRut,
        companyRutRaw: formatRut(companyRut),
        companyName,
        normalizedName: normalizeCompanyAgreementName(companyName),
        discountPercent:
          columns.discountCol >= 0
            ? parseAgreementDiscountPercent(row[columns.discountCol]) ??
              defaultDiscountPercent
            : defaultDiscountPercent,
        active: true,
      });
    }
  }

  return [...parsed.values()].sort((a, b) =>
    a.companyName.localeCompare(b.companyName, "es"),
  );
}

async function main() {
  const { filePath, isapreId, discountPercent } = parseCliArgs(
    process.argv.slice(2),
  );

  if (!existsSync(filePath)) {
    throw new Error(`Archivo no encontrado: ${filePath}`);
  }

  const isapre = await prisma.isapre.findUnique({
    where: { id: isapreId },
    select: { id: true, name: true },
  });
  if (!isapre) {
    throw new Error(
      `Isapre no encontrada: ${isapreId}. Verifica el catálogo antes de importar.`,
    );
  }

  const agreements = parseWorkbook(filePath, discountPercent);
  if (agreements.length === 0) {
    throw new Error("No se encontraron convenios válidos en el Excel.");
  }

  const sourceFile = path.basename(filePath);
  const activeCount = agreements.filter((agreement) => agreement.active).length;

  for (const agreement of agreements) {
    await prisma.companyAgreement.upsert({
      where: { companyRut: agreement.companyRut },
      create: {
        companyRut: agreement.companyRut,
        companyRutRaw: agreement.companyRutRaw,
        companyName: agreement.companyName,
        normalizedName: agreement.normalizedName,
        discountPercent: agreement.discountPercent,
        isapreId,
        sourceFile,
        active: agreement.active,
      },
      update: {
        companyRutRaw: agreement.companyRutRaw,
        companyName: agreement.companyName,
        normalizedName: agreement.normalizedName,
        discountPercent: agreement.discountPercent,
        isapreId,
        sourceFile,
        active: agreement.active,
      },
    });
  }

  console.log(
    `Convenios importados: ${agreements.length} (${activeCount} activos) desde ${path.relative(
      process.cwd(),
      filePath,
    )}`,
  );
  console.log(`Isapre: ${isapre.name} (${isapre.id}) · Descuento: ${discountPercent}%`);
}

main()
  .catch((error) => {
    console.error("Error al importar convenios:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => undefined);
  });
