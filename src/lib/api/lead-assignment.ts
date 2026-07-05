import { prisma } from "@/lib/prisma";

/**
 * Elige el ejecutivo activo con menos leads asignados (round-robin por carga).
 * En empate, prioriza el que lleva más tiempo sin recibir un lead nuevo.
 */
export async function pickExecutiveRoundRobin(): Promise<string | null> {
  const executives = await prisma.executiveAccount.findMany({
    where: { active: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (executives.length === 0) return null;

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

  const lastAssigned = await prisma.quote.groupBy({
    by: ["executiveAccountId"],
    where: { executiveAccountId: { not: null } },
    _max: { createdAt: true },
  });

  const lastByExecutive = new Map(
    lastAssigned
      .filter((row) => row.executiveAccountId)
      .map((row) => [
        row.executiveAccountId as string,
        row._max.createdAt?.getTime() ?? 0,
      ]),
  );

  let pickedId = executives[0].id;
  let minCount = countByExecutive.get(pickedId) ?? 0;
  let oldestAssignment = lastByExecutive.get(pickedId) ?? 0;

  for (const executive of executives) {
    const count = countByExecutive.get(executive.id) ?? 0;
    const lastAt = lastByExecutive.get(executive.id) ?? 0;

    if (
      count < minCount ||
      (count === minCount && lastAt < oldestAssignment)
    ) {
      pickedId = executive.id;
      minCount = count;
      oldestAssignment = lastAt;
    }
  }

  return pickedId;
}
