import {
  ISAPRE_CATALOG,
  resolveIsapreIdFromName,
  resolveIsapreNameFromId,
} from "@/lib/isapre-catalog";
import { prisma } from "@/lib/prisma";
import type { IsapreRecord } from "@/types/isapre";

function mapDbIsapre(isapre: {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): IsapreRecord {
  return {
    id: isapre.id,
    name: isapre.name,
    active: isapre.active,
    createdAt: isapre.createdAt.toISOString(),
    updatedAt: isapre.updatedAt.toISOString(),
  };
}

export async function ensureIsapreExists(isapreName: string): Promise<string> {
  const id = resolveIsapreIdFromName(isapreName);
  const name =
    ISAPRE_CATALOG.find((item) => item.id === id)?.name ?? isapreName.trim();

  await prisma.isapre.upsert({
    where: { id },
    create: { id, name },
    update: { name },
  });

  return id;
}

export async function readIsapres(): Promise<IsapreRecord[]> {
  const isapres = await prisma.isapre.findMany({
    orderBy: { name: "asc" },
  });

  return isapres.map(mapDbIsapre);
}

export async function seedIsapreCatalog(): Promise<void> {
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

export function getIsapreNameById(isapreId: string): string {
  return resolveIsapreNameFromId(isapreId);
}
