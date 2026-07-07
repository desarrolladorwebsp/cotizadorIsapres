import { Prisma, PrismaClient } from "@prisma/client";

const PRISMA_CACHE_KEY = "__cotizador_prisma_client__" as const;
const PRISMA_FINGERPRINT_KEY = "__cotizador_prisma_fingerprint__" as const;

/** Delegates that must exist after `prisma generate`; used to bust stale dev caches. */
const REQUIRED_DELEGATES = [
  "staffAccount",
  "staffInvite",
  "quoteActivity",
  "clientActivity",
  "planReview",
] as const;

const globalForPrisma = globalThis as unknown as {
  [PRISMA_CACHE_KEY]?: PrismaClient;
  [PRISMA_FINGERPRINT_KEY]?: string;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

function computeSchemaFingerprint(): string {
  const user = Prisma.dmmf.datamodel.models.find((model) => model.name === "User");
  const userFields = user?.fields.map((field) => field.name).join(",") ?? "";
  return `${REQUIRED_DELEGATES.join(",")}|${userFields}`;
}

function hasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every(
    (delegate) => delegate in client && client[delegate as keyof PrismaClient],
  );
}

function getPrismaClient(): PrismaClient {
  const fingerprint = computeSchemaFingerprint();
  const cached = globalForPrisma[PRISMA_CACHE_KEY];
  const cachedFingerprint = globalForPrisma[PRISMA_FINGERPRINT_KEY];

  if (
    cached &&
    (cachedFingerprint !== fingerprint || !hasRequiredDelegates(cached))
  ) {
    void cached.$disconnect().catch(() => undefined);
    delete globalForPrisma[PRISMA_CACHE_KEY];
    delete globalForPrisma[PRISMA_FINGERPRINT_KEY];
  }

  if (!globalForPrisma[PRISMA_CACHE_KEY]) {
    globalForPrisma[PRISMA_CACHE_KEY] = createPrismaClient();
    globalForPrisma[PRISMA_FINGERPRINT_KEY] = fingerprint;
  }

  return globalForPrisma[PRISMA_CACHE_KEY]!;
}

export const prisma = getPrismaClient();
