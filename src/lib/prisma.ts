import { PrismaClient } from "@prisma/client";

const PRISMA_CACHE_KEY = "__cotizador_prisma_client__" as const;

/** Delegates that must exist after `prisma generate`; used to bust stale dev caches. */
const REQUIRED_DELEGATES = ["staffAccount", "staffInvite", "quoteActivity"] as const;

const globalForPrisma = globalThis as unknown as {
  [PRISMA_CACHE_KEY]?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

function hasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every(
    (delegate) => delegate in client && client[delegate as keyof PrismaClient],
  );
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma[PRISMA_CACHE_KEY];

  if (cached && !hasRequiredDelegates(cached)) {
    void cached.$disconnect().catch(() => undefined);
    delete globalForPrisma[PRISMA_CACHE_KEY];
  }

  if (!globalForPrisma[PRISMA_CACHE_KEY]) {
    globalForPrisma[PRISMA_CACHE_KEY] = createPrismaClient();
  }

  return globalForPrisma[PRISMA_CACHE_KEY]!;
}

export const prisma = getPrismaClient();
