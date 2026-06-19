import { Prisma } from "@prisma/client";

/** Evita consultas repetidas cuando la tabla aún no existe (migración pendiente). */
let partnerEntityDbUnavailable = false;

export function isPartnerEntityDbUnavailable(): boolean {
  return partnerEntityDbUnavailable;
}

export function markPartnerEntityDbUnavailable(): void {
  partnerEntityDbUnavailable = true;
}

export function isPartnerEntitySchemaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021" || error.code === "P2022";
  }

  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: string }).code;
  return code === "P2021" || code === "P2022";
}

export function logPartnerEntitySchemaWarning(): void {
  if (process.env.NODE_ENV === "test") return;

  console.warn(
    "[partner_entities] Tabla no encontrada en la base de datos. " +
      "Usando entidades embebidas. Ejecuta: npm run db:migrate && npm run db:seed",
  );
}
