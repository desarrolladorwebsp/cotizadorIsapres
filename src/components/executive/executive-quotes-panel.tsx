"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminBadge,
  AdminPanel,
  AdminPanelHeader,
  AdminRefreshButton,
  AdminRowActions,
  AdminTable,
  AdminTableBody,
  AdminTableCard,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeaderCell,
  AdminTableRow,
  AdminToolbar,
} from "@/components/admin/admin-data-table";
import { assignQuoteToExecutive, fetchQuotes } from "@/lib/api/admin-client";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getPlanPdfDownloadUrl } from "@/lib/plan-pdf";
import { formatPlanClp, formatQuotedUf } from "@/lib/plan-format";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { touchTarget } from "@/lib/ui-tokens";
import type { QuoteRecord } from "@/types/quote";

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
  const { user } = useAuthSession("executive");
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "unassigned">("all");

  async function loadQuotes() {
    setLoading(true);
    try {
      setQuotes(await fetchQuotes());
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
  }, []);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (filter === "mine") {
        if (!user?.id || quote.executiveAccountId !== user.id) return false;
      }
      if (filter === "unassigned" && quote.executiveAccountId) return false;
      if (!query) return true;
      return [quote.fullName, quote.email, quote.phone, quote.planName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [quotes, search, filter, user?.id]);

  async function handleAssignToMe(quote: QuoteRecord) {
    try {
      await assignQuoteToExecutive(quote.id, { assignToMe: true });
      onNotify("Cotización asignada a tu cuenta.");
      await loadQuotes();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo asignar la cotización.",
        "error",
      );
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Mis cotizaciones"
        description="Cotizaciones asignadas a ti y solicitudes disponibles para tomar."
        actions={<AdminRefreshButton onClick={() => void loadQuotes()} />}
      />

      <AdminToolbar className="lg:grid-cols-[minmax(0,1fr)_12rem]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, correo o plan…"
          className={joinClasses("h-11", ui.input)}
        />
        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value as "all" | "mine" | "unassigned")
          }
          className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
        >
          <option value="all">Todas visibles</option>
          <option value="mine">Asignadas a mí</option>
          <option value="unassigned">Sin asignar</option>
        </select>
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredQuotes.length === 0}
        emptyTitle="No hay cotizaciones"
        loadingMessage="Cargando cotizaciones…"
        footer={`Mostrando ${filteredQuotes.length} cotizaciones.`}
      >
        <AdminTable minWidth="56rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Plan</AdminTableHeaderCell>
              <AdminTableHeaderCell>Precio</AdminTableHeaderCell>
              <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Acciones</AdminTableHeaderCell>
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
                    {quote.rut ? (
                      <p className="mt-1 text-xs text-muted">RUT {quote.rut}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted">{formatDate(quote.createdAt)}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p>{quote.planName ?? "—"}</p>
                    <p className="mt-1 text-xs text-muted">{quote.planIsapre ?? ""}</p>
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
                  <AdminTableCell>
                    <AdminBadge tone={quote.executiveAccountId ? "success" : "warning"}>
                      {quote.executiveAccountId
                        ? quote.executiveName ?? "Asignada"
                        : "Sin asignar"}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <AdminRowActions>
                      {!quote.executiveAccountId || quote.executiveAccountId === user?.id ? (
                        !quote.executiveAccountId ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void handleAssignToMe(quote)}
                        >
                          Asignarme
                        </Button>
                        ) : null
                      ) : null}
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={joinClasses(
                            "inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-primary hover:bg-surface-hover",
                            touchTarget,
                          )}
                        >
                          Ver PDF
                        </a>
                      ) : null}
                    </AdminRowActions>
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
