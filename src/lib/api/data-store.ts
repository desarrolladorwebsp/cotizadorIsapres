import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Clinic } from "@/types/clinic";
import type { HealthPlan } from "@/types/plan";

const PLANS_PATH = path.join(process.cwd(), "src/assets/planes.json");
const CLINICS_PATH = path.join(process.cwd(), "src/assets/clinics.json");

function extractClinicsFromPlans(plans: HealthPlan[]): Clinic[] {
  const map = new Map<string, string>();

  for (const plan of plans) {
    for (const entry of plan.coverage) {
      if (!map.has(entry.clinic_id)) {
        map.set(entry.clinic_id, entry.clinic_name);
      }
    }
  }

  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es-CL"));
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

export async function readPlans(): Promise<HealthPlan[]> {
  const raw = await readFile(PLANS_PATH, "utf-8");
  return JSON.parse(raw) as HealthPlan[];
}

export async function readPlanByCode(
  uniqueCode: string,
): Promise<HealthPlan | null> {
  const plans = await readPlans();
  return plans.find((plan) => plan.unique_code === uniqueCode) ?? null;
}

export async function writePlans(plans: HealthPlan[]): Promise<void> {
  await writeJsonFile(PLANS_PATH, plans);
}

export async function readClinics(): Promise<Clinic[]> {
  try {
    const raw = await readFile(CLINICS_PATH, "utf-8");
    return JSON.parse(raw) as Clinic[];
  } catch {
    const plans = await readPlans();
    const clinics = extractClinicsFromPlans(plans);
    await writeClinics(clinics);
    return clinics;
  }
}

export async function writeClinics(clinics: Clinic[]): Promise<void> {
  const sorted = [...clinics].sort((a, b) =>
    a.name.localeCompare(b.name, "es-CL"),
  );
  await writeJsonFile(CLINICS_PATH, sorted);
}

export async function syncClinicNameInPlans(
  clinicId: string,
  clinicName: string,
): Promise<void> {
  const plans = await readPlans();
  let changed = false;

  const nextPlans = plans.map((plan) => ({
    ...plan,
    coverage: plan.coverage.map((entry) => {
      if (entry.clinic_id !== clinicId) return entry;
      changed = true;
      return { ...entry, clinic_name: clinicName };
    }),
  }));

  if (changed) {
    await writePlans(nextPlans);
  }
}

export function countClinicUsage(
  plans: HealthPlan[],
  clinicId: string,
): number {
  return plans.reduce(
    (count, plan) =>
      count +
      plan.coverage.filter((entry) => entry.clinic_id === clinicId).length,
    0,
  );
}
