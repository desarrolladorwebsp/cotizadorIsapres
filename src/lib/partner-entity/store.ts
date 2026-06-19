import {
  DEFAULT_PARTNER_ENTITY_SLUG,
  getFallbackPartnerEntity,
} from "@/lib/partner-entity/fallback-entities";
import { RESERVED_ROOT_SEGMENTS } from "@/lib/partner-entity/constants";
import { prisma } from "@/lib/prisma";
import type {
  PartnerEntityPublic,
  PartnerEntityRecord,
  PartnerEntityTheme,
} from "@/types/partner-entity";
import type { PartnerEntity as DbPartnerEntity } from "@prisma/client";

function parseTheme(raw: unknown): PartnerEntityTheme {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as PartnerEntityTheme;
}

function mapDbPartnerEntity(entity: DbPartnerEntity): PartnerEntityRecord {
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    logoUrl: entity.logoUrl,
    websiteUrl: entity.websiteUrl,
    whatsappNumber: entity.whatsappNumber,
    whatsappMessage: entity.whatsappMessage,
    exitLabel: entity.exitLabel,
    brandKey: entity.brandKey,
    theme: parseTheme(entity.theme),
    active: entity.active,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

function mapFallbackToRecord(entity: PartnerEntityPublic): PartnerEntityRecord {
  return {
    id: `fallback-${entity.slug}`,
    ...entity,
    active: true,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  };
}

export function toPublicPartnerEntity(
  entity: PartnerEntityRecord,
): PartnerEntityPublic {
  return {
    slug: entity.slug,
    name: entity.name,
    logoUrl: entity.logoUrl,
    websiteUrl: entity.websiteUrl,
    whatsappNumber: entity.whatsappNumber,
    whatsappMessage: entity.whatsappMessage,
    exitLabel: entity.exitLabel,
    brandKey: entity.brandKey,
    theme: entity.theme,
  };
}

export async function readPartnerEntityBySlug(
  slug: string,
): Promise<PartnerEntityRecord | null> {
  const normalized = slug.trim().toLowerCase();

  if (typeof prisma.partnerEntity?.findFirst === "function") {
    try {
      const entity = await prisma.partnerEntity.findFirst({
        where: { slug: normalized, active: true },
      });

      if (entity) {
        return mapDbPartnerEntity(entity);
      }
    } catch (error) {
      console.error("readPartnerEntityBySlug: error de base de datos", error);
    }
  }

  const fallback = getFallbackPartnerEntity(normalized);
  return fallback ? mapFallbackToRecord(fallback) : null;
}

export async function readActivePartnerSlugs(): Promise<string[]> {
  if (typeof prisma.partnerEntity?.findMany === "function") {
    try {
      const entities = await prisma.partnerEntity.findMany({
        where: { active: true },
        select: { slug: true },
        orderBy: { name: "asc" },
      });

      if (entities.length > 0) {
        return entities.map((entity) => entity.slug);
      }
    } catch (error) {
      console.error("readActivePartnerSlugs: error de base de datos", error);
    }
  }

  return [DEFAULT_PARTNER_ENTITY_SLUG];
}

export function isReservedRootSegment(segment: string): boolean {
  return RESERVED_ROOT_SEGMENTS.has(segment.toLowerCase());
}

export function isValidPartnerSlugSegment(segment: string): boolean {
  const normalized = segment.trim().toLowerCase();
  if (!normalized || normalized.includes("/")) return false;
  if (isReservedRootSegment(normalized)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized);
}
