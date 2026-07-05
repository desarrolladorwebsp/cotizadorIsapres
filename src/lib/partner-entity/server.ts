import {
  DEFAULT_PARTNER_ENTITY_ENV,
  DEFAULT_PARTNER_ENTITY_SLUG,
} from "@/lib/partner-entity/constants";
import {
  getDefaultPartnerEntity,
  getPlatformPartnerEntity,
} from "@/lib/partner-entity/fallback-entities";
import {
  readPartnerEntityByAgentKey,
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

  const entity = await readPartnerEntityByAgentKey(slug);
  return entity ? toPublicPartnerEntity(entity) : null;
}

/** Resuelve entidad para /cotizador (agent key, cookie o default). */
export async function resolvePartnerEntityForCotizador(
  agentKey?: string,
  cookieSlug?: string,
): Promise<PartnerEntityPublic> {
  const candidates = [agentKey, cookieSlug].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  for (const key of candidates) {
    const entity = await readPartnerEntityByAgentKey(key);
    if (entity) return toPublicPartnerEntity(entity);
  }

  const entity = await readPartnerEntityBySlug(resolveDefaultSlug());
  if (entity) return toPublicPartnerEntity(entity);

  return getDefaultPartnerEntity();
}

/** Agente de la plataforma principal (cotizadorpremium.cl) — landing + cotizador por defecto. */
export async function readPlatformPartnerEntity(): Promise<PartnerEntityPublic> {
  const entity = await readPartnerEntityBySlug(getPlatformPartnerEntity().slug);
  if (entity) return toPublicPartnerEntity(entity);

  return getPlatformPartnerEntity();
}

export async function resolvePartnerEntityForHome(
  cookieSlug?: string,
): Promise<PartnerEntityPublic> {
  return resolvePartnerEntityForCotizador(undefined, cookieSlug);
}

export async function loadPartnerEntityPage(
  slug: string,
): Promise<PartnerEntityPublic | null> {
  const entity = await readPartnerEntityBySlug(slug);
  if (!entity) return null;

  return toPublicPartnerEntity(entity);
}

export async function loadPartnerEntityByEmbedKey(
  embedKey: string,
): Promise<PartnerEntityPublic | null> {
  const entity = await readPartnerEntityByAgentKey(embedKey);
  if (!entity) return null;

  return toPublicPartnerEntity(entity);
}
