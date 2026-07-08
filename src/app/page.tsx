import type { Metadata } from "next";
import { PlatformLandingView } from "@/components/platform/platform-landing-view";
import { LANDING_FALLBACK_REVIEWS } from "@/components/platform/landing/landing-reviews-data";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { readPublishedPlanReviews } from "@/lib/api/plan-review-store";
import {
  readActivePartnerSlugs,
  readPartnerEntityBySlug,
  toPublicPartnerEntity,
} from "@/lib/partner-entity/store";
import { readPlatformPartnerEntity } from "@/lib/partner-entity/server";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { buildLandingPageJsonLd } from "@/lib/seo/json-ld";
import type { PartnerEntityPublic } from "@/types/partner-entity";

export const metadata: Metadata = buildPageMetadata({
  title: "Cotizador Premium — Compara y cotiza planes Isapre en Chile",
  description:
    "Compara planes de salud Isapre en línea, cotiza según tu edad e ingreso y recibe asesoría personalizada. Plataforma multitenant para agentes y socios en Chile.",
  path: "/",
  absoluteTitle: true,
  keywords: [
    "cotizador isapre chile",
    "comparar planes de salud",
    "cotizar isapre online",
    "planes isapre precios",
    "asesoría isapre",
    "cotizador premium",
  ],
});

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
    <>
      <JsonLdScript data={buildLandingPageJsonLd()} />
      <PlatformLandingView
        platformEntity={platformEntity}
        partners={partners}
        reviews={reviews}
      />
    </>
  );
}
