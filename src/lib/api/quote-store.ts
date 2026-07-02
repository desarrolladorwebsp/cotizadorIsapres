import { prisma } from "@/lib/prisma";
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
    where: {
      OR: [{ executiveAccountId }, { executiveAccountId: null }],
    },
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

  const quote = await prisma.quote.create({
    data: {
      userId: client.id,
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
