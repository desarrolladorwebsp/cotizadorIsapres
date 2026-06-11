import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  ISAPRE_CATALOG,
  resolveIsapreIdFromName,
} from "../src/lib/isapre-catalog";
import type { Clinic } from "../src/types/clinic";
import type { HealthPlan } from "../src/types/plan";

const prisma = new PrismaClient();

const PLANS_PATH = path.join(process.cwd(), "src/assets/planes.json");
const CLINICS_PATH = path.join(process.cwd(), "src/assets/clinics.json");

const ADMIN_USERS = [
  {
    email: "admin@isaprespremium.cl",
    fullName: "Administrador Isapres Premium",
    phone: "+56912345678",
    rut: "11.111.111-1",
    role: "ADMIN" as const,
  },
  {
    email: "superadmin@isaprespremium.cl",
    fullName: "Carolina Rojas",
    phone: "+56987654321",
    rut: "22.222.222-2",
    role: "ADMIN" as const,
  },
];

const EXECUTIVE_USERS = [
  {
    email: "ejecutivo@isaprespremium.cl",
    fullName: "María González",
    phone: "+56911223344",
    rut: "15.555.555-5",
    role: "EXECUTIVE" as const,
  },
  {
    email: "ventas@isaprespremium.cl",
    fullName: "Pedro Sánchez",
    phone: "+56944332211",
    rut: "16.666.666-6",
    role: "EXECUTIVE" as const,
  },
];

const CLIENT_USERS = [
  {
    email: "juan.perez@demo.cl",
    fullName: "Juan Pérez",
    phone: "+56999887766",
    rut: "12.345.678-9",
    role: "CLIENT" as const,
  },
  {
    email: "ana.torres@demo.cl",
    fullName: "Ana Torres",
    phone: "+56988776655",
    rut: "18.765.432-1",
    role: "CLIENT" as const,
  },
  {
    email: "carlos.munoz@demo.cl",
    fullName: "Carlos Muñoz",
    phone: "+56977665544",
    rut: "19.876.543-2",
    role: "CLIENT" as const,
  },
];

async function seedIsapres() {
  await Promise.all(
    ISAPRE_CATALOG.map((item) =>
      prisma.isapre.upsert({
        where: { id: item.id },
        create: { id: item.id, name: item.name },
        update: { name: item.name, active: true },
      }),
    ),
  );
}

async function seedClinicsAndPlans() {
  const [plansRaw, clinicsRaw] = await Promise.all([
    readFile(PLANS_PATH, "utf-8"),
    readFile(CLINICS_PATH, "utf-8").catch(() => "[]"),
  ]);

  const plans = JSON.parse(plansRaw) as HealthPlan[];
  const clinics = JSON.parse(clinicsRaw) as Clinic[];

  const clinicMap = new Map<string, string>();

  for (const clinic of clinics) {
    clinicMap.set(clinic.id, clinic.name);
  }

  for (const plan of plans) {
    for (const entry of plan.coverage) {
      if (!clinicMap.has(entry.clinic_id)) {
        clinicMap.set(entry.clinic_id, entry.clinic_name);
      }
    }
  }

  await prisma.quote.deleteMany();
  await prisma.coverageEntry.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.clinic.deleteMany();

  await prisma.clinic.createMany({
    data: Array.from(clinicMap.entries()).map(([id, name]) => ({ id, name })),
    skipDuplicates: true,
  });

  for (const plan of plans) {
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
        hasTop: plan.has_top ?? false,
        additionalNotes: plan.additional_notes ?? null,
        pdfUrl: plan.pdf_url ?? null,
        pdfPublicId: plan.pdf_public_id ?? null,
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
  }

  return { plans, clinicCount: clinicMap.size };
}

async function seedUsers() {
  const allUsers = [...ADMIN_USERS, ...EXECUTIVE_USERS, ...CLIENT_USERS];

  for (const user of allUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        rut: user.rut,
        role: user.role,
        active: true,
      },
      update: {
        fullName: user.fullName,
        phone: user.phone,
        rut: user.rut,
        role: user.role,
        active: true,
      },
    });
  }

  return allUsers.length;
}

async function seedQuotes(plans: HealthPlan[]) {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { email: "asc" },
  });

  if (clients.length === 0 || plans.length === 0) return 0;

  const sampleQuotes = [
    {
      clientIndex: 0,
      planIndex: 0,
      status: "PENDING" as const,
      region: "rm",
      sex: "M",
      monthlyIncome: "1500000",
      contributorAge: 34,
      dependentsCount: 1,
      dependentAges: [32],
      finalPriceUf: 4.12,
      finalPriceClp: 158_420,
      ufValue: 38_450,
      beneficiaryCount: 2,
      totalFactors: 1.85,
      quoteReason: "Cotización web pública",
    },
    {
      clientIndex: 1,
      planIndex: Math.min(1, plans.length - 1),
      status: "CONTACTED" as const,
      region: "rm",
      sex: "F",
      monthlyIncome: "2200000",
      contributorAge: 28,
      dependentsCount: 0,
      dependentAges: [],
      finalPriceUf: 3.55,
      finalPriceClp: 136_498,
      ufValue: 38_450,
      beneficiaryCount: 1,
      totalFactors: 1.0,
      quoteReason: "Solicitud desde comparador",
      notes: "Cliente contactado por ejecutivo María González",
    },
    {
      clientIndex: 2,
      planIndex: Math.min(2, plans.length - 1),
      status: "CONVERTED" as const,
      region: "valparaiso",
      sex: "M",
      monthlyIncome: "980000",
      contributorAge: 45,
      dependentsCount: 2,
      dependentAges: [12, 8],
      finalPriceUf: 5.2,
      finalPriceClp: 199_940,
      ufValue: 38_450,
      beneficiaryCount: 3,
      totalFactors: 2.4,
      quoteReason: "Plan familiar",
      notes: "Contrato firmado",
    },
    {
      clientIndex: 0,
      planIndex: Math.min(3, plans.length - 1),
      status: "CANCELLED" as const,
      region: "rm",
      sex: "M",
      monthlyIncome: "1500000",
      contributorAge: 34,
      dependentsCount: 1,
      dependentAges: [32],
      finalPriceUf: 4.8,
      finalPriceClp: 184_560,
      ufValue: 38_450,
      beneficiaryCount: 2,
      totalFactors: 1.85,
      quoteReason: "Comparación de alternativas",
      notes: "Cliente eligió otra isapre",
    },
  ];

  for (const sample of sampleQuotes) {
    const client = clients[sample.clientIndex % clients.length];
    const plan = plans[sample.planIndex];

    await prisma.quote.create({
      data: {
        userId: client.id,
        planCode: plan.unique_code,
        status: sample.status,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone ?? "",
        rut: client.rut,
        region: sample.region,
        sex: sample.sex,
        monthlyIncome: sample.monthlyIncome,
        contributorAge: sample.contributorAge,
        dependentsCount: sample.dependentsCount,
        dependentAges: sample.dependentAges,
        quoteReason: sample.quoteReason,
        finalPriceUf: sample.finalPriceUf,
        finalPriceClp: sample.finalPriceClp,
        ufValue: sample.ufValue,
        beneficiaryCount: sample.beneficiaryCount,
        totalFactors: sample.totalFactors,
        notes: sample.notes ?? null,
      },
    });
  }

  return sampleQuotes.length;
}

async function main() {
  await seedIsapres();
  const { plans, clinicCount } = await seedClinicsAndPlans();
  const userCount = await seedUsers();
  const quoteCount = await seedQuotes(plans);

  const adminCount = ADMIN_USERS.length;
  const executiveCount = EXECUTIVE_USERS.length;
  const clientCount = CLIENT_USERS.length;

  console.log("Seed completado:");
  console.log(`  - ${ISAPRE_CATALOG.length} isapres`);
  console.log(`  - ${clinicCount} clínicas`);
  console.log(`  - ${plans.length} planes`);
  console.log(
    `  - ${userCount} usuarios (${adminCount} admin, ${executiveCount} ejecutivos, ${clientCount} clientes)`,
  );
  console.log(`  - ${quoteCount} cotizaciones`);
}

main()
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
