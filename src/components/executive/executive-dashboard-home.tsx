"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  fetchExecutiveClients,
  fetchQuotes,
} from "@/lib/api/admin-client";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import {
  executiveStatCardClass,
  executiveStatToneClass,
  type ExecutiveStatTone,
} from "@/lib/executive/action-styles";
import {
  ExecutiveActionIcon,
  IconClipboard,
  IconClock,
  IconUsers,
} from "@/components/executive/executive-icons";

interface DashboardStats {
  clients: number;
  quotes: number;
  pendingQuotes: number;
}

export function ExecutiveDashboardHome() {
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

  const statCards: Array<{
    label: string;
    value: number | undefined;
    tone: ExecutiveStatTone;
    icon: ReactNode;
  }> = [
    {
      label: "Mis clientes",
      value: stats?.clients,
      tone: "info",
      icon: <IconUsers />,
    },
    {
      label: "Cotizaciones",
      value: stats?.quotes,
      tone: "primary",
      icon: <IconClipboard />,
    },
    {
      label: "Prospectos pendientes",
      value: stats?.pendingQuotes,
      tone: "warning",
      icon: <IconClock />,
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
          Usa el menú superior para acceder al cotizador, tus clientes y
          cotizaciones.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.label} className={executiveStatCardClass(item.tone)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p
                  className={joinClasses(
                    "mt-2 text-3xl font-bold tabular-nums",
                    executiveStatToneClass[item.tone].value,
                  )}
                >
                  {loadingStats ? "—" : (item.value ?? 0)}
                </p>
              </div>
              <ExecutiveActionIcon tone={item.tone}>{item.icon}</ExecutiveActionIcon>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
