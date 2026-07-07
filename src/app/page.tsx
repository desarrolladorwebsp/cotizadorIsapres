import type { Metadata } from "next";
import { PlatformLandingView } from "@/components/platform/platform-landing-view";
import { LANDING_FALLBACK_REVIEWS } from "@/components/platform/landing/landing-reviews-data";
import { readPublishedPlanReviews } from "@/lib/api/plan-review-store";
import {
  readActivePartnerSlugs,
  readPartnerEntityBySlug,
  toPublicPartnerEntity,
} from "@/lib/partner-entity/store";
import { readPlatformPartnerEntity } from "@/lib/partner-entity/server";
import type { PartnerEntityPublic } from "@/types/partner-entity";

export const metadata: Metadata = {
  title: "Cotizador Premium — Plataforma de cotización Isapre",
  description:
    "Compara planes de salud, cotiza en línea y accede al panel de ejecutivos. Plataforma multitenant para agentes y socios.",
};

async function loadFeaturedPartners(): Promise<PartnerEntityPublic[]> {
  const slugs = await readActivePartnerSlugs();
  const partners: PartnerEntityPublic[] = [];

  for (const slug of slugs) {
    const entity = await readPartnerEntityBySlug(slug);
    if (entity) {
      partners.push(toPublicPartnerEntity(entity));
    }
  }

  return partners;
}

async function loadLandingReviews() {
  const fromDb = await readPublishedPlanReviews();
  return fromDb.length > 0 ? fromDb : LANDING_FALLBACK_REVIEWS;
}

export default async function HomePage() {
  const [platformEntity, partners, reviews] = await Promise.all([
    readPlatformPartnerEntity(),
    loadFeaturedPartners(),
    loadLandingReviews(),
  ]);

  return (
    <PlatformLandingView
      platformEntity={platformEntity}
      partners={partners}
      reviews={reviews}
    />
  );
}
