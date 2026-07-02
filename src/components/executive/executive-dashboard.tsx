"use client";

import { useState } from "react";
import { CotizadorWorkspace } from "@/components/cotizador/cotizador-workspace";
import { ExecutiveQuotesPanel } from "@/components/executive/executive-quotes-panel";
import { AdminToast } from "@/components/admin/admin-toast";
import { joinClasses } from "@/lib/utils";
import { touchTarget, ui } from "@/lib/ui-tokens";

type ExecutiveTab = "plans" | "quotes";

export function ExecutiveDashboard() {
  const [tab, setTab] = useState<ExecutiveTab>("plans");
  const [toast, setToast] = useState<{
    message: string;
    tone?: "success" | "error";
  } | null>(null);

  return (
    <div className="min-h-screen bg-bg-layout">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setTab("plans")}
            className={joinClasses(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              touchTarget,
              tab === "plans"
                ? "bg-primary text-primary-foreground"
                : joinClasses("text-muted", ui.hoverSurface),
            )}
          >
            Planes
          </button>
          <button
            type="button"
            onClick={() => setTab("quotes")}
            className={joinClasses(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              touchTarget,
              tab === "quotes"
                ? "bg-primary text-primary-foreground"
                : joinClasses("text-muted", ui.hoverSurface),
            )}
          >
            Cotizaciones
          </button>
        </div>
      </div>

      {tab === "plans" ? (
        <CotizadorWorkspace variant="executive" />
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <ExecutiveQuotesPanel
            onNotify={(message, tone = "success") => setToast({ message, tone })}
          />
        </div>
      )}

      <AdminToast
        message={toast?.message ?? null}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
