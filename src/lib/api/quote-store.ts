import { prisma } from "@/lib/prisma";
import { pickExecutiveRoundRobin } from "@/lib/api/lead-assignment";
import type { CreateQuoteInput, QuoteRecord, QuoteStatus } from "@/types/quote";
import type { Quote as DbQuote, Plan, Isapre, ExecutiveAccount } from "@prisma/client";
import { upsertUserByEmail } from "./user-store";

type QuoteWithRelations = DbQuote & {
  plan?: (Pick<Plan, "planName"> & { isapreRef: Pick<Isapre, "name"> }) | null;
  executiveAccount?: Pick<ExecutiveAccount, "fullName"> | null;
};

function mapDbQuote(quote: QuoteWithRelations): QuoteRecord {
  const dependentAges = Array.isArray(quote.dependentAges)
    ? (quote.dependentAges as number[])
    : undefined;

  return {
    id: quote.id,
    userId: quote.userId,
    planCode: quote.planCode,
    status: quote.status as QuoteStatus,
    fullName: quote.fullName,
    email: quote.email,
    phone: quote.phone,
    rut: quote.rut,
    region: quote.region,
    sex: quote.sex,
    monthlyIncome: quote.monthlyIncome,
    contributorAge: quote.contributorAge,
    dependentsCount: quote.dependentsCount,
    dependentAges,
    contactPreference: quote.contactPreference,
    quoteReason: quote.quoteReason,
    finalPriceUf: quote.finalPriceUf,
    finalPriceClp: quote.finalPriceClp,
    ufValue: quote.ufValue,
    beneficiaryCount: quote.beneficiaryCount,
    totalFactors: quote.totalFactors,
    notes: quote.notes,
    partnerEntitySlug: quote.partnerEntitySlug,
    partnerEntityName: quote.partnerEntityName,
    executiveAccountId: quote.executiveAccountId,
    executiveName: quote.executiveAccount?.fullName ?? null,
    planName: quote.plan?.planName ?? null,
    planIsapre: quote.plan?.isapreRef?.name ?? null,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  };
}

const quoteInclude = {
  plan: {
    select: {
      planName: true,
      isapreRef: { select: { name: true } },
    },
  },
  executiveAccount: {
    select: { fullName: true },
  },
} as const;

export async function readQuotes(): Promise<QuoteRecord[]> {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });

  return quotes.map(mapDbQuote);
}

export async function readQuotesForExecutive(
  executiveAccountId: string,
): Promise<QuoteRecord[]> {
  const quotes = await prisma.quote.findMany({
    where: { executiveAccountId },
    orderBy: { createdAt: "desc" },
    include: quoteInclude,
  });

  return quotes.map(mapDbQuote);
}

export async function readQuoteById(id: string): Promise<QuoteRecord | null> {
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: quoteInclude,
  });
  return quote ? mapDbQuote(quote) : null;
}

export async function createQuote(
  input: CreateQuoteInput,
): Promise<QuoteRecord> {
  const client = await upsertUserByEmail({
    email: input.email,
    fullName: input.fullName,
    phone: input.phone,
    rut: input.rut ?? null,
    role: "CLIENT",
  });

  const executiveAccountId = await pickExecutiveRoundRobin();

  const quote = await prisma.quote.create({
    data: {
      userId: client.id,
      executiveAccountId,
      planCode: input.planCode ?? null,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      rut: input.rut?.trim() ?? null,
      region: input.region ?? null,
      sex: input.sex ?? null,
      monthlyIncome: input.monthlyIncome ?? null,
      contributorAge: input.contributorAge ?? null,
      dependentsCount: input.dependentsCount ?? 0,
      dependentAges: input.dependentAges ?? undefined,
      contactPreference: input.contactPreference ?? null,
      quoteReason: input.quoteReason ?? null,
      finalPriceUf: input.finalPriceUf ?? null,
      finalPriceClp: input.finalPriceClp ?? null,
      ufValue: input.ufValue ?? null,
      beneficiaryCount: input.beneficiaryCount ?? null,
      totalFactors: input.totalFactors ?? null,
      notes: input.notes ?? null,
      partnerEntitySlug: input.partnerEntitySlug?.trim().toLowerCase() || null,
      partnerEntityName: input.partnerEntityName?.trim() || null,
    },
    include: quoteInclude,
  });

  if (executiveAccountId && client.id) {
    await prisma.user.update({
      where: { id: client.id },
      data: { assignedExecutiveId: executiveAccountId },
    });
  }

  return mapDbQuote(quote);
}

export async function updateQuoteAssignment(input: {
  quoteId: string;
  executiveAccountId: string | null;
  status?: QuoteStatus;
}): Promise<QuoteRecord> {
  const quote = await prisma.quote.update({
    where: { id: input.quoteId },
    data: {
      executiveAccountId: input.executiveAccountId,
      status: input.status,
    },
    include: quoteInclude,
  });

  if (input.executiveAccountId && quote.userId) {
    await prisma.user.update({
      where: { id: quote.userId },
      data: { assignedExecutiveId: input.executiveAccountId },
    });
  }

  return mapDbQuote(quote);
}

export async function assignQuoteToExecutive(
  quoteId: string,
  executiveAccountId: string,
): Promise<QuoteRecord> {
  return updateQuoteAssignment({ quoteId, executiveAccountId });
}

export async function updateQuoteStatus(
  quoteId: string,
  status: QuoteStatus,
): Promise<QuoteRecord> {
  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: { status },
    include: quoteInclude,
  });

  return mapDbQuote(quote);
}

/** Asigna todos los leads sin ejecutivo usando round-robin equitativo. */
export async function distributeUnassignedQuotes(): Promise<{
  assigned: number;
  remaining: number;
}> {
  const unassigned = await prisma.quote.findMany({
    where: { executiveAccountId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  let assigned = 0;

  for (const quote of unassigned) {
    const executiveAccountId = await pickExecutiveRoundRobin();
    if (!executiveAccountId) break;

    await updateQuoteAssignment({ quoteId: quote.id, executiveAccountId });
    assigned += 1;
  }

  const remaining = await prisma.quote.count({
    where: { executiveAccountId: null },
  });

  return { assigned, remaining };
}

export interface ExecutiveAssignmentStat {
  executiveId: string;
  fullName: string;
  email: string;
  active: boolean;
  assignedCount: number;
}

/** Conteo de leads por ejecutivo (para balance en panel admin). */
export async function readExecutiveAssignmentStats(): Promise<
  ExecutiveAssignmentStat[]
> {
  const executives = await prisma.executiveAccount.findMany({
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, email: true, active: true },
  });

  const counts = await prisma.quote.groupBy({
    by: ["executiveAccountId"],
    where: { executiveAccountId: { not: null } },
    _count: { id: true },
  });

  const countByExecutive = new Map(
    counts
      .filter((row) => row.executiveAccountId)
      .map((row) => [row.executiveAccountId as string, row._count.id]),
  );

  return executives.map((executive) => ({
    executiveId: executive.id,
    fullName: executive.fullName,
    email: executive.email,
    active: executive.active,
    assignedCount: countByExecutive.get(executive.id) ?? 0,
  }));
}
