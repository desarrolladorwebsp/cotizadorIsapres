import type { Metadata } from "next";
import { LandingMarketingShell } from "@/components/platform/landing/landing-marketing-shell";
import { PoliticaPrivacidadView } from "@/components/platform/politica-privacidad-view";
import { buildPageMetadata } from "@/lib/seo/build-page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Política de Privacidad y Protección de Datos Personales",
  description:
    "Conoce cómo Cotizador Premium trata tus datos personales conforme a la Ley chilena N° 21.719 sobre protección de datos personales.",
  path: "/politica-privacidad",
  keywords: [
    "política de privacidad",
    "protección de datos personales",
    "ley 21.719 chile",
    "cotizador premium",
  ],
});

export default function PoliticaPrivacidadPage() {
  return (
    <LandingMarketingShell headerSubtitle="Protección de datos personales">
      <PoliticaPrivacidadView />
    </LandingMarketingShell>
  );
}
