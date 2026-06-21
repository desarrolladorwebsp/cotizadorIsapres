"use client";

import { Fragment, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatPlanClp, formatQuotedUf } from "@/lib/plan-format";
import { REGION_OPTIONS, SEX_OPTIONS } from "@/lib/quote-criteria-options";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { QuoteRecord } from "@/types/quote";

export interface QuotesPanelProps {
  quotes: QuoteRecord[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const STATUS_LABELS: Record<QuoteRecord["status"], string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CONVERTED: "Convertido",
  CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<QuoteRecord["status"], string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONTACTED: "bg-sky-100 text-sky-900",
  CONVERTED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-zinc-100 text-zinc-600",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function resolvePartnerLabel(quote: QuoteRecord): string {
  if (quote.partnerEntityName) return quote.partnerEntityName;
  if (quote.partnerEntitySlug) return quote.partnerEntitySlug;
  return "Sin origen";
}

function resolveRegionLabel(region: string | null | undefined): string {
  if (!region) return "—";
  return (
    REGION_OPTIONS.find((option) => option.value === region)?.label ?? region
  );
}

function resolveSexLabel(sex: string | null | undefined): string {
  if (!sex) return "—";
  return SEX_OPTIONS.find((option) => option.value === sex)?.label ?? sex;
}

function formatIncome(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const digits = value.replace(/\D/g, "");
  const amount = Number(digits);
  if (!Number.isFinite(amount) || amount <= 0) return value;

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatBeneficiaries(quote: QuoteRecord): string {
  const parts: string[] = [];

  if (quote.contributorAge != null) {
    parts.push(`Titular ${quote.contributorAge} años`);
  }

  if ((quote.dependentsCount ?? 0) > 0) {
    const ages =
      quote.dependentAges && quote.dependentAges.length > 0
        ? ` (${quote.dependentAges.join(", ")} años)`
        : "";
    parts.push(`${quote.dependentsCount} carga${quote.dependentsCount === 1 ? "" : "s"}${ages}`);
  }

  if (quote.beneficiaryCount != null && quote.beneficiaryCount > 0) {
    parts.push(`${quote.beneficiaryCount} beneficiario${quote.beneficiaryCount === 1 ? "" : "s"}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

function normalizePhoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  return digits.startsWith("56") ? `+${digits}` : `+56${digits}`;
}

export function QuotesPanel({ quotes, loading, onRefresh }: QuotesPanelProps) {
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<QuoteRecord["status"] | "all">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const partnerOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const quote of quotes) {
      const slug = quote.partnerEntitySlug ?? "sin-origen";
      const label = resolvePartnerLabel(quote);
      map.set(slug, label);
    }

    return [...map.entries()]
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [quotes]);

  const stats = useMemo(() => {
    return {
      total: quotes.length,
      pending: quotes.filter((quote) => quote.status === "PENDING").length,
      contacted: quotes.filter((quote) => quote.status === "CONTACTED").length,
      converted: quotes.filter((quote) => quote.status === "CONVERTED").length,
    };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const partnerSlug = quote.partnerEntitySlug ?? "sin-origen";
      if (partnerFilter !== "all" && partnerSlug !== partnerFilter) {
        return false;
      }

      if (statusFilter !== "all" && quote.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return [
        quote.fullName,
        quote.email,
        quote.phone,
        quote.rut,
        quote.planCode,
        quote.planName,
        quote.planIsapre,
        quote.partnerEntityName,
        quote.partnerEntitySlug,
        quote.region,
        quote.notes,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [quotes, search, partnerFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-dark">Cotizaciones</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Solicitudes enviadas desde el cotizador. Revisa quién pidió el plan,
            sus datos de contacto y el origen de cada solicitud.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          className={joinClasses(
            touchTarget,
            "rounded-lg px-4 text-sm font-semibold",
            ui.ctaOutline,
          )}
        >
          Actualizar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: stats.total, tone: "text-primary-dark" },
          { label: "Pendientes", value: stats.pending, tone: "text-amber-700" },
          { label: "Contactados", value: stats.contacted, tone: "text-sky-700" },
          {
            label: "Convertidos",
            value: stats.converted,
            tone: "text-emerald-700",
          },
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

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, RUT, correo, plan u origen…"
          className={joinClasses("h-11", ui.input)}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as QuoteRecord["status"] | "all")
          }
          className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
        >
          <option value="all">Todos los estados</option>
          {(Object.keys(STATUS_LABELS) as QuoteRecord["status"][]).map(
            (status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ),
          )}
        </select>

        <select
          value={partnerFilter}
          onChange={(event) => setPartnerFilter(event.target.value)}
          className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
        >
          <option value="all">Todos los orígenes</option>
          {partnerOptions.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        className={joinClasses(
          "overflow-hidden rounded-2xl border bg-white shadow-sm",
          ui.border,
        )}
      >
        {loading ? (
          <p className="px-6 py-16 text-center text-sm text-muted">
            Cargando cotizaciones…
          </p>
        ) : filteredQuotes.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">
              No hay cotizaciones para mostrar
            </p>
            <p className="mt-2 text-sm text-muted">
              Las solicitudes aparecerán aquí cuando alguien use
              &quot;Solicitar con ejecutivo&quot; en el cotizador.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[72rem] w-full text-left text-sm">
              <thead className="border-b bg-bg-layout/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Solicitante</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Plan solicitado</th>
                  <th className="px-4 py-3 font-semibold">Precio est.</th>
                  <th className="px-4 py-3 font-semibold">Origen</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => {
                  const isExpanded = expandedId === quote.id;

                  return (
                    <Fragment key={quote.id}>
                      <tr className="border-b transition hover:bg-bg-layout/40">
                        <td className="px-4 py-4 align-top whitespace-nowrap text-muted">
                          {formatDate(quote.createdAt)}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-foreground">
                            {quote.fullName}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            RUT: {quote.rut?.trim() || "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <a
                            href={`mailto:${quote.email}`}
                            className="block text-primary-dark underline-offset-2 hover:underline"
                          >
                            {quote.email}
                          </a>
                          <a
                            href={`tel:${normalizePhoneHref(quote.phone)}`}
                            className="mt-1 block text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
                          >
                            {quote.phone}
                          </a>
                        </td>

                        <td className="px-4 py-4 align-top text-xs leading-relaxed text-muted">
                          <p>{resolveRegionLabel(quote.region)}</p>
                          <p className="mt-1">
                            {resolveSexLabel(quote.sex)}
                            {quote.contributorAge != null
                              ? ` · ${quote.contributorAge} años`
                              : ""}
                          </p>
                          <p className="mt-1">{formatIncome(quote.monthlyIncome)}</p>
                          <p className="mt-1">{formatBeneficiaries(quote)}</p>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {quote.planName || quote.planIsapre ? (
                            <>
                              {quote.planIsapre ? (
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                                  {quote.planIsapre}
                                </p>
                              ) : null}
                              <p className="mt-1 font-semibold text-foreground">
                                {quote.planName ?? "Plan sin nombre"}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">—</p>
                          )}
                          {quote.planCode ? (
                            <p className="mt-1 font-mono text-xs text-muted">
                              {quote.planCode}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          {quote.finalPriceClp != null ? (
                            <>
                              <p className="font-semibold tabular-nums text-foreground">
                                {formatPlanClp(quote.finalPriceClp)}
                              </p>
                              {quote.finalPriceUf != null ? (
                                <p className="mt-1 text-xs tabular-nums text-muted">
                                  {formatQuotedUf(quote.finalPriceUf)}
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-foreground">
                            {resolvePartnerLabel(quote)}
                          </p>
                          {quote.partnerEntitySlug ? (
                            <p className="text-xs text-muted">
                              /{quote.partnerEntitySlug}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span
                            className={joinClasses(
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              STATUS_STYLES[quote.status],
                            )}
                          >
                            {STATUS_LABELS[quote.status]}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : quote.id)
                            }
                            className={joinClasses(
                              "rounded-lg px-2 py-1 text-xs font-semibold text-primary-dark",
                              ui.hoverSurface,
                            )}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? "Ocultar" : "Detalle"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="border-b bg-bg-layout/30">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                              <DetailBlock
                                label="Motivo"
                                value={quote.quoteReason ?? "—"}
                              />
                              <DetailBlock
                                label="Notas"
                                value={quote.notes ?? "—"}
                              />
                              <DetailBlock
                                label="Preferencia de contacto"
                                value={quote.contactPreference ?? "—"}
                              />
                              <DetailBlock
                                label="Factores de riesgo"
                                value={
                                  quote.totalFactors != null
                                    ? String(quote.totalFactors)
                                    : "—"
                                }
                              />
                              <DetailBlock
                                label="Valor UF al cotizar"
                                value={
                                  quote.ufValue != null
                                    ? formatPlanClp(quote.ufValue)
                                    : "—"
                                }
                              />
                              <DetailBlock
                                label="ID solicitud"
                                value={quote.id}
                                mono
                              />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones.
      </p>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={joinClasses(
          "mt-1 text-sm text-foreground",
          mono ? "font-mono text-xs break-all" : "",
        )}
      >
        {value}
      </p>
    </div>
  );
}
