import Link from "next/link";
import type { Metadata } from "next";
import { PlatformLandingView } from "@/components/platform/platform-landing-view";
import {
  readActivePartnerSlugs,
  readPartnerEntityBySlug,
  toPublicPartnerEntity,
} from "@/lib/partner-entity/store";
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

export default async function HomePage() {
  const partners = await loadFeaturedPartners();

  return <PlatformLandingView partners={partners} />;
}
