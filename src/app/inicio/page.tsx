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
import { PLATFORM_LANDING_PATH } from "@/lib/partner-entity/platform-agent";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";
import { isLegacySeoRequest } from "@/lib/seo/request-host";
import { buildLandingPageJsonLd } from "@/lib/seo/json-ld";
import type { PartnerEntityPublic } from "@/types/partner-entity";

export async function generateMetadata(): Promise<Metadata> {
  const legacyHost = await isLegacySeoRequest();

  return buildPageMetadata({
    title: "Cotizador Premium — Cotiza y compara planes Isapre en Chile",
    description:
      "Cotizador Premium oficial: compara planes de salud Isapre en línea, cotiza según tu edad e ingreso y recibe asesoría personalizada en Chile.",
    path: PLATFORM_LANDING_PATH,
    absoluteTitle: true,
    forceNoIndex: legacyHost,
    keywords: [
      "cotizador premium",
      "cotizadorpremium.cl",
      "cotizador isapre chile",
      "comparar planes de salud",
      "cotizar isapre online",
      "planes isapre precios",
      "asesoría isapre",
    ],
  });
}

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

/** Landing marketing. No usar `/index`: en Vercel/Next se resuelve como `/`. */
export default async function LandingInicioPage() {
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
