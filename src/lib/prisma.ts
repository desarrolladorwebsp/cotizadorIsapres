import { PrismaClient } from "@prisma/client";

const PRISMA_CACHE_KEY = "__cotizador_prisma_client__" as const;

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

export const prisma =
  globalForPrisma[PRISMA_CACHE_KEY] ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma[PRISMA_CACHE_KEY] = prisma;
}
