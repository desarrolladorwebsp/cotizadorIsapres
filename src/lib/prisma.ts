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
  "companyAgreement",
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
  return Prisma.dmmf.datamodel.models
    .map((model) => model.name)
    .sort()
    .join(",");
}

function hasRequiredDelegates(client: PrismaClient): boolean {
  return REQUIRED_DELEGATES.every(
    (delegate) => delegate in client && client[delegate as keyof PrismaClient],
  );
}

export function getPrismaClient(): PrismaClient {
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

/** Revalida la caché en cada acceso (evita clientes Prisma obsoletos en dev/HMR). */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
