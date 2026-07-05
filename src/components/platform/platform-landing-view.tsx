import Link from "next/link";
import type { PartnerEntityPublic } from "@/types/partner-entity";
import { LandingHero } from "./landing/landing-hero";
import { LandingPartnersSection } from "./landing/landing-partners-section";
import { landing } from "./landing/landing-tokens";
import "./landing/landing.css";

interface PlatformLandingViewProps {
  partners: PartnerEntityPublic[];
}

const FEATURES = [
  {
    title: "Cotización precisa",
    description:
      "Motor de precios Isapre con factores de riesgo, GES y beneficiarios — misma lógica que usan los ejecutivos.",
  },
  {
    title: "Marca de tu agente",
    description:
      "Logo, colores y contacto WhatsApp personalizados por socio mediante Agent Key.",
  },
  {
    title: "Widget embebible",
    description:
      "Vista previa en el sitio del socio; un clic lleva al cotizador completo en cotizadorpremium.cl.",
  },
  {
    title: "Panel ejecutivo",
    description:
      "Acceso privado para comparar planes, filtrar y gestionar cotizaciones enviadas.",
  },
] as const;

export function PlatformLandingView({ partners }: PlatformLandingViewProps) {
  return (
    <div data-landing className={landing.pageRoot}>
      <header className={landing.header}>
        <div className={landing.headerInner}>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-cta">
              CP
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">
                Cotizador Premium
              </p>
              <p className="text-xs text-muted">Salud prepaga en Chile</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/cotizador" className={landing.navLink}>
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
        <LandingHero />

        <LandingPartnersSection partners={partners} />

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-foreground">
            Qué incluye la plataforma
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-border bg-background p-6 shadow-card"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-border bg-background p-8 shadow-card sm:p-10">
            <h2 className="text-2xl font-bold text-foreground">
              Acceso ejecutivos
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Ingresa con tu cuenta corporativa para ver el catálogo completo,
              aplicar filtros avanzados y gestionar cotizaciones (email y
              WhatsApp en roadmap).
            </p>
            <Link
              href="/cotizador/ejecutivos/login"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-cta transition hover:bg-primary-hover"
            >
              Iniciar sesión ejecutivo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Cotizador Premium</p>
          <div className="flex gap-4">
            <Link href="/cotizador/admin/login" className="hover:text-foreground">
              Admin
            </Link>
            <a
              href="mailto:cotizador@cotizaloantes.cl"
              className="hover:text-foreground"
            >
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
