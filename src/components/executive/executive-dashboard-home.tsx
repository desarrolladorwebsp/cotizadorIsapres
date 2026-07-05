"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  fetchExecutiveClients,
  fetchQuotes,
} from "@/lib/api/admin-client";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { ExecutiveSection } from "@/components/executive/executive-shell";

export interface ExecutiveDashboardHomeProps {
  hasAdminAccess: boolean;
  onNavigate: (section: ExecutiveSection) => void;
}

interface DashboardStats {
  clients: number;
  quotes: number;
  pendingQuotes: number;
}

const quickLinks: {
  section: ExecutiveSection;
  title: string;
  description: string;
  accent: string;
  icon: React.ReactNode;
}[] = [
  {
    section: "cotizador",
    title: "Cotizador para ejecutivos",
    description:
      "Explora el catálogo de planes, compara coberturas y descarga PDFs para asesorar a tus clientes.",
    accent: "from-primary/15 to-primary/5",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6 text-primary"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M4 7h16M4 12h10M4 17h6"
          strokeLinecap="round"
        />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    section: "clientes",
    title: "Clientes asignados",
    description:
      "Consulta la cartera de clientes vinculados a tu cuenta por el equipo administrativo.",
    accent: "from-sky-500/15 to-sky-500/5",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6 text-sky-700"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path
          d="M3 19c0-2.5 2.7-4 6-4s6 1.5 6 4M14 19c0-1.8 1.8-3 4-3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    section: "cotizaciones",
    title: "Cotizaciones realizadas",
    description:
      "Revisa leads asignados, actualiza el estado del pipeline y accede a los detalles de cada cotización.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-6 text-emerald-700"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          strokeLinecap="round"
        />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function ExecutiveDashboardHome({
  hasAdminAccess,
  onNavigate,
}: ExecutiveDashboardHomeProps) {
  const { user } = useAuthSession("executive");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [clients, quotes] = await Promise.all([
          fetchExecutiveClients(),
          fetchQuotes(),
        ]);

        if (!cancelled) {
          setStats({
            clients: clients.length,
            quotes: quotes.length,
            pendingQuotes: quotes.filter((quote) => quote.status === "PENDING")
              .length,
          });
        }
      } catch {
        if (!cancelled) {
          setStats(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const statCards = [
    {
      label: "Clientes asignados",
      value: stats?.clients,
      tone: "text-sky-700",
    },
    {
      label: "Cotizaciones",
      value: stats?.quotes,
      tone: "text-primary-dark",
    },
    {
      label: "Prospectos pendientes",
      value: stats?.pendingQuotes,
      tone: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-8">
      <section
        className={joinClasses(
          "overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-white to-white p-6 shadow-sm sm:p-8",
          ui.border,
        )}
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl">
          {greeting}
          {user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Desde aquí accedes a tus herramientas comerciales: cotiza planes,
          gestiona clientes asignados y da seguimiento a tus cotizaciones.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {statCards.map((item) => (
          <div
            key={item.label}
            className={joinClasses(
              "rounded-xl border bg-white px-4 py-4 shadow-sm",
              ui.border,
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p
              className={joinClasses(
                "mt-2 text-3xl font-bold tabular-nums",
                item.tone,
              )}
            >
              {loadingStats ? "—" : (item.value ?? 0)}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => (
          <button
            key={item.section}
            type="button"
            onClick={() => onNavigate(item.section)}
            className={joinClasses(
              "group flex h-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              touchTarget,
              ui.border,
            )}
          >
            <div
              className={joinClasses(
                "mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
                item.accent,
              )}
            >
              {item.icon}
            </div>
            <h2 className="text-base font-bold text-primary-dark">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
            <span
              className={joinClasses(
                "mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary",
                "group-hover:underline",
              )}
            >
              Ir a la sección
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-4"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        ))}

        {hasAdminAccess ? (
          <>
            {(
              [
                {
                  section: "prospectos" as const,
                  title: "Prospectos globales",
                  description:
                    "Gestiona todos los leads del sistema: asignación, estados e historial.",
                  accent: "from-violet-500/15 to-violet-500/5",
                },
                {
                  section: "usuarios" as const,
                  title: "Usuarios ejecutivos",
                  description:
                    "Invita ejecutivos, controla asignaciones y permisos de acceso.",
                  accent: "from-indigo-500/15 to-indigo-500/5",
                },
                {
                  section: "clinicas" as const,
                  title: "Clínicas y prestadores",
                  description:
                    "Administra el catálogo de prestadores usado en coberturas.",
                  accent: "from-sky-500/15 to-sky-500/5",
                },
                {
                  section: "ges" as const,
                  title: "Valores GES",
                  description:
                    "Actualiza los montos GES por Isapre para el cotizador.",
                  accent: "from-amber-500/15 to-amber-500/5",
                },
              ] as const
            ).map((item) => (
              <button
                key={item.section}
                type="button"
                onClick={() => onNavigate(item.section)}
                className={joinClasses(
                  "group flex h-full flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                  touchTarget,
                  ui.border,
                )}
              >
                <div
                  className={joinClasses(
                    "mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br",
                    item.accent,
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-6 text-primary-dark"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path d="M12 3l8 4v6c0 4.5-3.5 7.5-8 8-4.5-.5-8-3.5-8-8V7l8-4z" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-primary-dark">{item.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <span
                  className={joinClasses(
                    "mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary",
                    "group-hover:underline",
                  )}
                >
                  Ir a la sección
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            ))}
          </>
        ) : null}
      </section>
    </div>
  );
}
