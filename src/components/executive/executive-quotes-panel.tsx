"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminBadge } from "@/components/admin/admin-data-table";
import { Input } from "@/components/ui/input";
import {
  AdminPanel,
  AdminPanelHeader,
  AdminRefreshButton,
  AdminTable,
  AdminTableBody,
  AdminTableCard,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminToolbar,
} from "@/components/admin/admin-data-table";
import {
  QuoteLeadActions,
  QuoteLeadActionsHint,
  QuoteStatusBadge,
} from "@/components/lead/quote-lead-actions";
import { useStaffSession } from "@/hooks/use-auth-session";
import {
  assignQuoteToExecutive,
  fetchExecutiveAccounts,
  fetchQuotes,
  updateQuoteLead,
} from "@/lib/api/admin-client";
import { getPlanPdfDownloadUrl } from "@/lib/plan-pdf";
import { formatPlanClp, formatQuotedUf } from "@/lib/plan-format";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_OPTIONS,
} from "@/lib/quote-status";
import { ui, touchTarget } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { QuoteRecord, QuoteStatus } from "@/types/quote";
import type { StaffAccountRecord } from "@/types/staff-account";

export interface ExecutiveQuotesPanelProps {
  onNotify: (message: string, tone?: "success" | "error") => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ExecutiveQuotesPanel({ onNotify }: ExecutiveQuotesPanelProps) {
  const { isAdmin, user } = useStaffSession();
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [executives, setExecutives] = useState<StaffAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [executiveFilter, setExecutiveFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const outreachName = isAdmin
    ? null
    : (user?.fullName ?? null);

  async function loadQuotes() {
    setLoading(true);
    try {
      const nextQuotes = await fetchQuotes();
      setQuotes(nextQuotes);

      if (isAdmin) {
        const nextExecutives = await fetchExecutiveAccounts();
        setExecutives(nextExecutives);
      }
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudieron cargar cotizaciones.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuotes();
  }, [isAdmin]);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;

      if (isAdmin) {
        if (executiveFilter === "unassigned" && quote.executiveAccountId) {
          return false;
        }
        if (
          executiveFilter !== "all" &&
          executiveFilter !== "unassigned" &&
          quote.executiveAccountId !== executiveFilter
        ) {
          return false;
        }
      }

      if (!query) return true;

      const values = [
        quote.fullName,
        quote.email,
        quote.phone,
        quote.planName,
        quote.rut,
        quote.executiveName,
      ];

      return values
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [quotes, search, statusFilter, executiveFilter, isAdmin]);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      prospect: quotes.filter((q) => q.status === "PENDING").length,
      contracting: quotes.filter((q) => q.status === "CONTACTED").length,
      purchased: quotes.filter((q) => q.status === "CONVERTED").length,
      rejected: quotes.filter((q) => q.status === "CANCELLED").length,
      unassigned: quotes.filter((q) => !q.executiveAccountId).length,
    };
  }, [quotes]);

  async function handleStatusChange(quote: QuoteRecord, status: QuoteStatus) {
    setSavingId(quote.id);
    try {
      if (isAdmin) {
        await updateQuoteLead(quote.id, { status });
      } else {
        await assignQuoteToExecutive(quote.id, { status });
      }
      onNotify(`Estado actualizado: ${QUOTE_STATUS_LABELS[status]}.`);
      await loadQuotes();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo actualizar el estado.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleExecutiveChange(
    quote: QuoteRecord,
    executiveAccountId: string | null,
  ) {
    setSavingId(quote.id);
    try {
      await updateQuoteLead(quote.id, { executiveAccountId });
      onNotify(
        executiveAccountId
          ? "Ejecutivo asignado correctamente."
          : "Cotización sin ejecutivo asignado.",
      );
      await loadQuotes();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo reasignar el ejecutivo.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title={isAdmin ? "Cotizaciones del sistema" : "Cotizaciones realizadas"}
        description={
          isAdmin
            ? "Todas las solicitudes de planes registradas en el cotizador. Puedes ver y reasignar el ejecutivo responsable de cada una."
            : "Cotizaciones asignadas a tu cuenta. Contacta al cliente y actualiza el estado del pipeline."
        }
        actions={<AdminRefreshButton onClick={() => void loadQuotes()} />}
      />

      <div
        className={joinClasses(
          "grid gap-3",
          isAdmin ? "sm:grid-cols-2 xl:grid-cols-6" : "sm:grid-cols-2 xl:grid-cols-5",
        )}
      >
        {[
          { label: "Total", value: stats.total, tone: "text-primary-dark" },
          ...(isAdmin
            ? [
                {
                  label: "Sin asignar",
                  value: stats.unassigned,
                  tone: "text-violet-700",
                },
              ]
            : []),
          { label: "Prospectos", value: stats.prospect, tone: "text-amber-700" },
          { label: "Contratantes", value: stats.contracting, tone: "text-sky-700" },
          { label: "Compraron", value: stats.purchased, tone: "text-emerald-700" },
          { label: "Rechazaron", value: stats.rejected, tone: "text-gray-600" },
        ].map((item) => (
          <div
            key={item.label}
            className={joinClasses(
              "rounded-xl border bg-white px-4 py-3 shadow-sm",
              ui.border,
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {item.label}
            </p>
            <p className={joinClasses("mt-1 text-2xl font-bold tabular-nums", item.tone)}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <AdminToolbar
        className={
          isAdmin
            ? "lg:grid-cols-[minmax(0,1fr)_11rem_11rem]"
            : "lg:grid-cols-[minmax(0,1fr)_12rem]"
        }
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            isAdmin
              ? "Buscar por nombre, correo, RUT, plan o ejecutivo…"
              : "Buscar por nombre, correo, RUT o plan…"
          }
          className={joinClasses("h-11", ui.input)}
        />
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as QuoteStatus | "all")
          }
          className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
        >
          <option value="all">Todos los estados</option>
          {QUOTE_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {QUOTE_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {isAdmin ? (
          <select
            value={executiveFilter}
            onChange={(event) => setExecutiveFilter(event.target.value)}
            className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
          >
            <option value="all">Todos los ejecutivos</option>
            <option value="unassigned">Sin asignar</option>
            {executives.map((executive) => (
              <option key={executive.id} value={executive.id}>
                {executive.fullName}
              </option>
            ))}
          </select>
        ) : null}
      </AdminToolbar>

      <QuoteLeadActionsHint />

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredQuotes.length === 0}
        emptyTitle={
          isAdmin
            ? "No hay cotizaciones registradas"
            : "No tienes cotizaciones asignadas"
        }
        emptyDescription={
          isAdmin
            ? "Las solicitudes aparecerán aquí cuando los clientes usen el cotizador público."
            : "Las nuevas cotizaciones aparecerán aquí cuando te sean asignadas."
        }
        loadingMessage="Cargando cotizaciones…"
        footer={`Mostrando ${filteredQuotes.length} de ${quotes.length} cotizaciones.`}
      >
        <AdminTable minWidth={isAdmin ? "72rem" : "64rem"}>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Plan</AdminTableHeaderCell>
              <AdminTableHeaderCell>Precio</AdminTableHeaderCell>
              {isAdmin ? (
                <AdminTableHeaderCell>Ejecutivo asignado</AdminTableHeaderCell>
              ) : null}
              <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
              <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredQuotes.map((quote) => {
              const pdfUrl = quote.planCode
                ? getPlanPdfDownloadUrl({ uniqueCode: quote.planCode })
                : null;

              return (
                <AdminTableRow key={quote.id}>
                  <AdminTableCell>
                    <p className="font-semibold text-foreground">{quote.fullName}</p>
                    <p className="mt-1 text-xs text-muted">{quote.email}</p>
                    <p className="mt-1 text-xs text-muted">{quote.phone}</p>
                    {quote.rut ? (
                      <p className="mt-1 text-xs text-muted">RUT {quote.rut}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted">{formatDate(quote.createdAt)}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p>{quote.planName ?? "—"}</p>
                    <p className="mt-1 text-xs text-muted">{quote.planIsapre ?? ""}</p>
                    {pdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={joinClasses(
                          "mt-2 inline-flex text-xs font-semibold text-primary underline-offset-2 hover:underline",
                          touchTarget,
                        )}
                      >
                        Ver PDF del plan
                      </a>
                    ) : null}
                  </AdminTableCell>
                  <AdminTableCell>
                    <p>
                      {quote.finalPriceUf != null
                        ? formatQuotedUf(quote.finalPriceUf)
                        : "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {quote.finalPriceClp != null
                        ? formatPlanClp(quote.finalPriceClp)
                        : "—"}
                    </p>
                  </AdminTableCell>
                  {isAdmin ? (
                    <AdminTableCell>
                      {quote.executiveName ? (
                        <AdminBadge tone="info">{quote.executiveName}</AdminBadge>
                      ) : (
                        <AdminBadge tone="warning">Sin asignar</AdminBadge>
                      )}
                      <select
                        value={quote.executiveAccountId ?? ""}
                        disabled={savingId === quote.id}
                        onChange={(event) => {
                          const value = event.target.value;
                          void handleExecutiveChange(
                            quote,
                            value ? value : null,
                          );
                        }}
                        className={joinClasses(
                          "mt-2 h-9 w-full min-w-[10rem] rounded-lg px-2 text-xs",
                          ui.input,
                        )}
                        aria-label="Reasignar ejecutivo"
                      >
                        <option value="">Sin asignar</option>
                        {executives.map((executive) => (
                          <option key={executive.id} value={executive.id}>
                            {executive.fullName}
                          </option>
                        ))}
                      </select>
                    </AdminTableCell>
                  ) : null}
                  <AdminTableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </AdminTableCell>
                  <AdminTableCell>
                    <QuoteLeadActions
                      quote={quote}
                      executiveName={outreachName ?? quote.executiveName}
                      canEditStatus
                      saving={savingId === quote.id}
                      onStatusChange={(status) =>
                        void handleStatusChange(quote, status)
                      }
                      compact
                    />
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>
    </AdminPanel>
  );
}
