"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFormModal } from "@/components/admin/admin-data-table";
import { ClientOriginBadge } from "@/components/executive/client-origin-badge";
import {
  createExecutiveClient,
  fetchExecutiveClients,
  updateClientAdvisedPlan,
} from "@/lib/api/admin-client";
import { useOptionalCompanyAgreementContext } from "@/components/cotizador/company-agreement";
import { formatAgreementDiscountBadge } from "@/components/cotizador/company-agreement/plan-agreement-price";
import {
  buildPlanAgreementPriceDisplay,
  resolveAgreementDiscountPercentForPlan,
} from "@/lib/company-agreements/plan-price-discount";
import { sanitizeRutInput } from "@/lib/auth/rut";
import { buildPlanFinalPriceQuote, formatPlanClp, formatQuotedUf } from "@/domain";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";
import type { UserRecord } from "@/types/user";

type AssignMode = "existing" | "new";

export interface AssignPlanToClientModalProps {
  plan: HealthPlan | null;
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  open: boolean;
  onClose: () => void;
  onAssigned: (client: UserRecord) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

const EMPTY_NEW_CLIENT = {
  firstNames: "",
  lastNames: "",
  email: "",
  phone: "",
  rut: "",
  pipelineNotes: "",
};

export function AssignPlanToClientModal({
  plan,
  beneficiarySummary,
  ufToClp,
  open,
  onClose,
  onAssigned,
  onNotify,
}: AssignPlanToClientModalProps) {
  const [mode, setMode] = useState<AssignMode>("existing");
  const [clients, setClients] = useState<UserRecord[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [newClient, setNewClient] = useState(EMPTY_NEW_CLIENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setClientSearch("");
    setSelectedClientId(null);
    setNotes("");
    setNewClient(EMPTY_NEW_CLIENT);

    let cancelled = false;
    setLoadingClients(true);

    void (async () => {
      try {
        const rows = await fetchExecutiveClients();
        if (!cancelled) setClients(rows);
      } catch {
        if (!cancelled) {
          onNotify("No se pudieron cargar tus clientes.", "error");
        }
      } finally {
        if (!cancelled) setLoadingClients(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, onNotify]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      [client.fullName, client.email, client.phone, client.rut]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clients, clientSearch]);

  const agreement =
    useOptionalCompanyAgreementContext()?.validatedAgreement ?? null;

  const priceQuote = useMemo(() => {
    if (!plan) return null;
    return buildPlanFinalPriceQuote(
      plan.base_price_uf,
      beneficiarySummary,
      ufToClp,
      plan.ges_premium_uf,
    );
  }, [plan, beneficiarySummary, ufToClp]);

  const agreementPrices = useMemo(() => {
    if (!plan || !priceQuote) return null;
    return buildPlanAgreementPriceDisplay(
      priceQuote,
      resolveAgreementDiscountPercentForPlan(plan.isapre, agreement),
    );
  }, [agreement, plan, priceQuote]);

  if (!plan) return null;

  async function handleAssign() {
    if (!plan) return;
    setSaving(true);

    try {
      let client: UserRecord;

      if (mode === "new") {
        client = await createExecutiveClient({
          email: newClient.email.trim(),
          phone: newClient.phone.trim() || null,
          rut: newClient.rut.trim() || null,
          firstNames: newClient.firstNames.trim(),
          lastNames: newClient.lastNames.trim(),
          pipelineNotes: newClient.pipelineNotes.trim() || null,
        });
      } else {
        const existing = clients.find((row) => row.id === selectedClientId);
        if (!existing) {
          onNotify("Selecciona un cliente de la lista.", "error");
          setSaving(false);
          return;
        }
        client = existing;
      }

      const updated = await updateClientAdvisedPlan(client.id, {
        planCode: plan.unique_code,
        notes:
          notes.trim() ||
          `Plan ${plan.plan_name} (${plan.unique_code}) asignado desde el cotizador.`,
      });

      onAssigned(updated);
      onNotify(`Plan asignado a ${updated.fullName}.`);
      onClose();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo asignar el plan.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  const canSubmit =
    mode === "existing"
      ? Boolean(selectedClientId)
      : Boolean(
          newClient.firstNames.trim() &&
            newClient.lastNames.trim() &&
            newClient.email.trim(),
        );

  return (
    <AdminFormModal
      open={open}
      onClose={onClose}
      title="Asignar plan a cliente"
      description="Vincula este plan a un cliente de tu cartera o registra uno nuevo."
      size="lg"
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Plan seleccionado
          </p>
          <p className="mt-1 text-base font-bold text-foreground">
            {plan.isapre} · {plan.plan_name}
          </p>
          <p className="text-sm text-muted">{plan.unique_code}</p>
          {agreementPrices ? (
            <div className="mt-2 space-y-1">
              {agreementPrices.hasAgreementDiscount ? (
                <span className="inline-flex rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {formatAgreementDiscountBadge(agreementPrices.discountPercent)}{" "}
                  convenio
                </span>
              ) : null}
              {agreementPrices.hasAgreementDiscount ? (
                <p className="text-xs tabular-nums text-muted line-through">
                  {formatQuotedUf(agreementPrices.listFinalPriceUf)} ·{" "}
                  {formatPlanClp(agreementPrices.listFinalPriceClp)}
                </p>
              ) : null}
              <p
                className={joinClasses(
                  "text-sm font-semibold",
                  agreementPrices.hasAgreementDiscount
                    ? "text-red-700"
                    : "text-primary-dark",
                )}
              >
                {formatQuotedUf(agreementPrices.displayFinalPriceUf)}
                <span
                  className={joinClasses(
                    "ml-2 font-normal",
                    agreementPrices.hasAgreementDiscount
                      ? "text-red-700/75"
                      : "text-muted",
                  )}
                >
                  ({formatPlanClp(agreementPrices.displayFinalPriceClp)} aprox.)
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("existing")}
            className={joinClasses(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "existing"
                ? "bg-primary text-white"
                : "bg-surface-hover text-muted hover:text-foreground",
            )}
          >
            Cliente existente
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={joinClasses(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              mode === "new"
                ? "bg-primary text-white"
                : "bg-surface-hover text-muted hover:text-foreground",
            )}
          >
            Nuevo cliente
          </button>
        </div>

        {mode === "existing" ? (
          <div className="space-y-3">
            <Input
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
              placeholder="Buscar cliente por nombre, correo o RUT…"
              disabled={loadingClients}
            />
            {loadingClients ? (
              <p className="text-sm text-muted">Cargando clientes…</p>
            ) : filteredClients.length > 0 ? (
              <ul className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border bg-white p-2">
                {filteredClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <li key={client.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedClientId(client.id)}
                        className={joinClasses(
                          "w-full rounded-lg px-3 py-2.5 text-left transition",
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/30"
                            : "hover:bg-surface-hover",
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">
                            {client.fullName}
                          </span>
                          <ClientOriginBadge
                            origin={client.clientOrigin}
                            cotizadorSource={client.cotizadorSource}
                          />
                        </div>
                        <span className="mt-0.5 block text-xs text-muted">
                          {client.email}
                          {client.phone ? ` · ${client.phone}` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted">
                {clients.length === 0
                  ? "Aún no tienes clientes. Usa la pestaña Nuevo cliente."
                  : "No hay clientes que coincidan con la búsqueda."}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Nombres *</span>
              <Input
                required
                value={newClient.firstNames}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    firstNames: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Apellidos *</span>
              <Input
                required
                value={newClient.lastNames}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    lastNames: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Correo *</span>
              <Input
                type="email"
                required
                value={newClient.email}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Teléfono</span>
              <Input
                value={newClient.phone}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">RUT</span>
              <Input
                value={newClient.rut}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    rut: sanitizeRutInput(event.target.value),
                  }))
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Notas</span>
              <textarea
                value={newClient.pipelineNotes}
                onChange={(event) =>
                  setNewClient((current) => ({
                    ...current,
                    pipelineNotes: event.target.value,
                  }))
                }
                rows={2}
                className={joinClasses("w-full rounded-xl px-3 py-2 text-sm", ui.input)}
              />
            </label>
          </div>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-medium">Notas de asignación</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            placeholder="Opcional: motivo de la asignación o contexto para el seguimiento…"
            className={joinClasses("w-full rounded-xl px-3 py-2 text-sm", ui.input)}
          />
        </label>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={saving || !canSubmit}
            variant="success"
            onClick={() => void handleAssign()}
          >
            {saving ? "Asignando…" : "Asignar plan"}
          </Button>
        </div>
      </div>
    </AdminFormModal>
  );
}
