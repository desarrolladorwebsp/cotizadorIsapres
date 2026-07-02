import Image from "next/image";
import Link from "next/link";
import type { PartnerEntityPublic } from "@/types/partner-entity";

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
    <div className="min-h-full bg-bg-layout">
      <header className="border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              CP
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">
                Cotizador Premium
              </p>
              <p className="text-xs text-muted">cotizadorpremium.cl</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/cotizador"
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-hover"
            >
              Cotizar
            </Link>
            <Link
              href="/cotizador/ejecutivos/login"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-cta transition hover:bg-primary-hover"
            >
              Acceso ejecutivos
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-gradient-to-b from-background to-bg-layout">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                Plataforma multitenant
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                Cotiza planes Isapre con la identidad de tu agente
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Cotizador Premium centraliza comparación de planes, widgets para
                socios y paneles para ejecutivos y administradores — sin
                duplicar cálculos ni catálogos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/cotizador?agent=cotizaloantes"
                  className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-cta transition hover:bg-primary-hover"
                >
                  Probar cotizador
                </Link>
                <Link
                  href="/cotizador?agent=cotizaloantes&embed=1"
                  className="inline-flex items-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-hover"
                >
                  Vista previa widget
                </Link>
              </div>
            </div>
          </div>
        </section>

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

        {partners.length > 0 ? (
          <section className="border-y border-border bg-background">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <h2 className="text-2xl font-bold text-foreground">
                Socios y agentes
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Cada socio tiene su Agent Key para widgets y deep links con
                branding propio.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner) => (
                  <li
                    key={partner.slug}
                    className="flex items-center gap-4 rounded-2xl border border-border p-4"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-layout">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {partner.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        Agent Key:{" "}
                        <code className="rounded bg-bg-layout px-1 py-0.5">
                          {partner.embedKey}
                        </code>
                      </p>
                      <Link
                        href={`/cotizador?agent=${encodeURIComponent(partner.embedKey)}`}
                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Ver cotizador →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

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
