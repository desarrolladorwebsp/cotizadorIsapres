import {
  DEFAULT_PARTNER_ENTITY_ENV,
  DEFAULT_PARTNER_ENTITY_SLUG,
} from "@/lib/partner-entity/constants";
import { getDefaultPartnerEntity } from "@/lib/partner-entity/fallback-entities";
import {
  readPartnerEntityBySlug,
  toPublicPartnerEntity,
} from "@/lib/partner-entity/store";
import type { PartnerEntityPublic } from "@/types/partner-entity";

function resolveDefaultSlug(): string {
  return (
    process.env[DEFAULT_PARTNER_ENTITY_ENV]?.trim().toLowerCase() ||
    DEFAULT_PARTNER_ENTITY_SLUG
  );
}

export async function readPartnerEntityFromCookieSlug(
  slug: string | undefined,
): Promise<PartnerEntityPublic | null> {
  if (!slug) return null;

  const entity = await readPartnerEntityBySlug(slug);
  return entity ? toPublicPartnerEntity(entity) : null;
}

export async function resolvePartnerEntityForHome(
  cookieSlug?: string,
): Promise<PartnerEntityPublic> {
  const fromCookie = await readPartnerEntityFromCookieSlug(cookieSlug);
  if (fromCookie) return fromCookie;

  const entity = await readPartnerEntityBySlug(resolveDefaultSlug());
  if (entity) return toPublicPartnerEntity(entity);

  return getDefaultPartnerEntity();
}

export async function loadPartnerEntityPage(
  slug: string,
): Promise<PartnerEntityPublic | null> {
  const entity = await readPartnerEntityBySlug(slug);
  if (!entity) return null;

  return toPublicPartnerEntity(entity);
}
