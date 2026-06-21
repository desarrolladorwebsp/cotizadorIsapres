import { prisma } from "@/lib/prisma";
import type { CreateQuoteInput, QuoteRecord, QuoteStatus } from "@/types/quote";
import type { Quote as DbQuote, Plan, Isapre } from "@prisma/client";
import { upsertUserByEmail } from "./user-store";

function mapDbQuote(
  quote: DbQuote & {
    plan?: (Pick<Plan, "planName"> & { isapreRef: Pick<Isapre, "name"> }) | null;
  },
): QuoteRecord {
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
    planName: quote.plan?.planName ?? null,
    planIsapre: quote.plan?.isapreRef?.name ?? null,
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
  };
}

export async function readQuotes(): Promise<QuoteRecord[]> {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      plan: {
        select: {
          planName: true,
          isapreRef: { select: { name: true } },
        },
      },
    },
  });

  return quotes.map(mapDbQuote);
}

export async function readQuoteById(id: string): Promise<QuoteRecord | null> {
  const quote = await prisma.quote.findUnique({ where: { id } });
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
  });

  return mapDbQuote(quote);
}
