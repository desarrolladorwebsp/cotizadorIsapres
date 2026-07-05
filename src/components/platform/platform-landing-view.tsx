import Link from "next/link";
import type { PartnerEntityPublic } from "@/types/partner-entity";
import { buildCotizadorPremiumCotizadorUrl } from "@/lib/partner-entity/platform-agent";
import { LandingBrandThemeEffect } from "./landing/landing-brand-theme-effect";
import { LandingCotizadorWidgetSection } from "./landing/landing-cotizador-widget-section";
import { LandingFooter } from "./landing/landing-footer";
import { LandingHero } from "./landing/landing-hero";
import { LandingIsapresSection } from "./landing/landing-isapres-section";
import { LandingPageBackdrop } from "./landing/landing-page-backdrop";
import { LandingPartnersSection } from "./landing/landing-partners-section";
import { landing } from "./landing/landing-tokens";
import "./landing/landing.css";

interface PlatformLandingViewProps {
  /** Agente de cotizadorpremium.cl (nombre en header; colores solo desde landing.css). */
  platformEntity: PartnerEntityPublic;
  partners: PartnerEntityPublic[];
}

export function PlatformLandingView({
  platformEntity,
  partners,
}: PlatformLandingViewProps) {
  const cotizadorHref = buildCotizadorPremiumCotizadorUrl();

  return (
    <div data-landing data-brand="premium" className={landing.pageRoot}>
      <LandingBrandThemeEffect />
      <LandingPageBackdrop />
      <header className={`${landing.header} landing-header-over-backdrop`}>
        <div className={landing.headerInner}>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-cta">
              CP
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">
                {platformEntity.name}
              </p>
              <p className="text-xs text-muted">Salud prepaga en Chile</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link href={cotizadorHref} className={landing.navLink}>
              Cotizar
            </Link>
            <Link
              href="/cotizador/ejecutivos/login"
              className={landing.navCta}
            >
              Acceso ejecutivos
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <LandingHero cotizadorHref={cotizadorHref} />
        <LandingPartnersSection partners={partners} />
        <LandingCotizadorWidgetSection />
        <LandingIsapresSection />
      </main>

      <LandingFooter />
    </div>
  );
}
