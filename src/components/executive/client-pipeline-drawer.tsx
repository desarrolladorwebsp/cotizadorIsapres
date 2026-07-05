"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFormModal } from "@/components/admin/admin-data-table";
import { ClientPipelineStatusBadge } from "@/components/executive/client-pipeline-status-badge";
import { updateClientPipeline } from "@/lib/api/admin-client";
import {
  buildEmptyClosedRecord,
  buildDefaultClientChecklist,
  CLIENT_PIPELINE_STATUS_DESCRIPTIONS,
  CLIENT_PIPELINE_STATUS_LABELS,
  CLIENT_PIPELINE_STATUS_OPTIONS,
} from "@/lib/client-pipeline/constants";
import { buildWhatsAppUrl } from "@/lib/partner-entity/theme";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  ClientChecklist,
  ClientClosedRecord,
  ClientPipelineStatus,
} from "@/types/client-pipeline";
import type { UserRecord } from "@/types/user";

export interface ClientPipelineDrawerProps {
  client: UserRecord | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (client: UserRecord) => void;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ClientPipelineDrawer({
  client,
  open,
  onClose,
  onUpdated,
  onNotify,
}: ClientPipelineDrawerProps) {
  const [pipelineStatus, setPipelineStatus] = useState<ClientPipelineStatus>("NUEVO");
  const [checklist, setChecklist] = useState<ClientChecklist>(buildDefaultClientChecklist());
  const [closedRecord, setClosedRecord] = useState<ClientClosedRecord>(
    buildEmptyClosedRecord(),
  );
  const [pipelineNotes, setPipelineNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !client) return;
    setPipelineStatus(client.pipelineStatus ?? "NUEVO");
    setChecklist(client.checklist ?? buildDefaultClientChecklist());
    setClosedRecord(client.closedRecord ?? buildEmptyClosedRecord());
    setPipelineNotes(client.pipelineNotes ?? "");
  }, [open, client]);

  const checklistProgress = useMemo(() => {
    const total = checklist.items.length;
    const done = checklist.items.filter((item) => item.checked).length;
    return { total, done };
  }, [checklist]);

  if (!client) return null;

  const whatsappUrl = client.phone
    ? buildWhatsAppUrl(
        client.phone,
        `Hola ${client.fullName.split(/\s+/)[0] || ""}, te contacto desde Cotizador Premium respecto a tu solicitud de plan de salud.`,
      )
    : null;

  function toggleChecklistItem(itemId: string) {
    setChecklist((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              checked: !item.checked,
              checkedAt: !item.checked ? new Date().toISOString() : null,
            }
          : item,
      ),
      updatedAt: new Date().toISOString(),
    }));
  }

  async function handleSave() {
    if (!client) return;
    setSaving(true);
    try {
      const updated = await updateClientPipeline(client.id, {
        pipelineStatus,
        checklist,
        closedRecord:
          pipelineStatus === "CERRADO" ? closedRecord : client.closedRecord,
        pipelineNotes: pipelineNotes.trim() || null,
      });
      onUpdated(updated);
      onNotify("Cliente actualizado.");
      onClose();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo guardar.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminFormModal
      open={open}
      onClose={onClose}
      title={client.fullName}
      description="Gestiona el estado, checklist de documentos Isapre y registro de cierre."
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <ClientPipelineStatusBadge status={pipelineStatus} />
          <span className="text-xs text-muted">
            {checklistProgress.done}/{checklistProgress.total} documentos listos
          </span>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          ) : null}
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Estado del cliente</span>
          <select
            value={pipelineStatus}
            onChange={(event) =>
              setPipelineStatus(event.target.value as ClientPipelineStatus)
            }
            className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
          >
            {CLIENT_PIPELINE_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {CLIENT_PIPELINE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            {CLIENT_PIPELINE_STATUS_DESCRIPTIONS[pipelineStatus]}
          </p>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              Checklist Isapre
            </h3>
            <span className="text-xs text-muted">Puedes ir marcando durante todo el proceso</span>
          </div>
          <ul className="space-y-2 rounded-xl border border-border bg-bg-layout/40 p-3">
            {checklist.items.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface-hover">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5 size-4 rounded border-border text-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={joinClasses(
                        "block text-sm",
                        item.checked
                          ? "text-muted line-through"
                          : "text-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                    {item.checked && item.checkedAt ? (
                      <span className="mt-0.5 block text-[11px] text-muted">
                        Listo ·{" "}
                        {new Intl.DateTimeFormat("es-CL", {
                          dateStyle: "short",
                        }).format(new Date(item.checkedAt))}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence>
          {pipelineStatus === "CERRADO" ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h3 className="text-sm font-semibold text-primary-dark">
                  Registro de cierre
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium">Isapre *</span>
                    <Input
                      value={closedRecord.isapre}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          isapre: event.target.value,
                        }))
                      }
                      placeholder="Ej. Consalud"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Código plan</span>
                    <Input
                      value={closedRecord.planCode ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          planCode: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Nombre plan</span>
                    <Input
                      value={closedRecord.planName ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          planName: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Fecha cierre *</span>
                    <Input
                      type="date"
                      value={closedRecord.closedAt}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          closedAt: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Nº solicitud Isapre</span>
                    <Input
                      value={closedRecord.isapreReference ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          isapreReference: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Precio final UF</span>
                    <Input
                      value={closedRecord.finalPriceUf ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          finalPriceUf: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Precio final CLP</span>
                    <Input
                      value={closedRecord.finalPriceClp ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          finalPriceClp: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-medium">Notas de cierre</span>
                    <textarea
                      value={closedRecord.notes ?? ""}
                      onChange={(event) =>
                        setClosedRecord((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      className={joinClasses(
                        "w-full rounded-xl px-3 py-2 text-sm",
                        ui.input,
                      )}
                    />
                  </label>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Notas internas</span>
          <textarea
            value={pipelineNotes}
            onChange={(event) => setPipelineNotes(event.target.value)}
            rows={3}
            placeholder="Observaciones del ejecutivo durante el proceso…"
            className={joinClasses("w-full rounded-xl px-3 py-2 text-sm", ui.input)}
          />
        </label>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </AdminFormModal>
  );
}
