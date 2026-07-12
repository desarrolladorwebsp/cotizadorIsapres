"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconSettings,
  IconUserPlus,
  IconWhatsApp,
} from "@/components/executive/executive-icons";
import { executiveLeadBannerClass } from "@/lib/executive/action-styles";
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
  AdminRowActions,
  AdminToolbar,
  TableCellStack,
} from "@/components/admin/admin-data-table";
import {
  assignClientToExecutive,
  distributeUnassignedClients,
  fetchExecutiveAccounts,
  fetchExecutiveClients,
} from "@/lib/api/admin-client";
import { useStaffSession } from "@/hooks/use-auth-session";
import { ClientPipelineDrawer } from "@/components/executive/client-pipeline-drawer";
import { ClientPipelineStatusBadge } from "@/components/executive/client-pipeline-status-badge";
import { ClientPlanSummary } from "@/components/executive/client-plan-summary";
import { ClientOriginBadge } from "@/components/executive/client-origin-badge";
import { CotizadorSourceBadge } from "@/components/executive/cotizador-source-badge";
import { CreateClientModal } from "@/components/executive/create-client-modal";
import { buildClientWhatsAppMessage } from "@/lib/client-pipeline/constants";
import { buildWhatsAppUrl } from "@/lib/partner-entity/theme";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { StaffAccountRecord } from "@/types/staff-account";
import type { UserRecord } from "@/types/user";

export interface ExecutiveClientsPanelProps {
  onNotify: (message: string, tone?: "success" | "error") => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "medium",
  }).format(new Date(value));
}

export function ExecutiveClientsPanel({
  onNotify,
}: ExecutiveClientsPanelProps) {
  const { isAdmin } = useStaffSession();
  const [clients, setClients] = useState<UserRecord[]>([]);
  const [executives, setExecutives] = useState<StaffAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [distributing, setDistributing] = useState(false);
  const [pipelineClient, setPipelineClient] = useState<UserRecord | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  async function loadClients() {
    setLoading(true);
    try {
      const [nextClients, nextExecutives] = await Promise.all([
        fetchExecutiveClients(),
        isAdmin ? fetchExecutiveAccounts() : Promise.resolve([]),
      ]);
      setClients(nextClients);
      setExecutives(nextExecutives);
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudieron cargar los clientes.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadClients();
  }, [isAdmin]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) =>
      [
        client.fullName,
        client.email,
        client.phone,
        client.rut,
        client.cotizadorSource?.label,
        client.cotizadorSource?.slug,
        client.cotizadorSource?.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clients, search]);

  const unassignedCount = useMemo(
    () => clients.filter((client) => !client.assignedExecutiveId).length,
    [clients],
  );

  const assignedLeadCount = useMemo(
    () => clients.filter((client) => client.clientOrigin === "COTIZADOR").length,
    [clients],
  );

  async function handleAssignExecutive(
    client: UserRecord,
    executiveAccountId: string | null,
  ) {
    setSavingId(client.id);
    try {
      const updated = await assignClientToExecutive(client.id, executiveAccountId);
      setClients((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
      onNotify(
        executiveAccountId
          ? `Cliente asignado a ${updated.assignedExecutiveName ?? "ejecutivo"}.`
          : "Cliente sin ejecutivo asignado.",
      );
    } catch (error) {
      onNotify(
        error instanceof Error
          ? error.message
          : "No se pudo asignar el ejecutivo.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDistributeUnassigned() {
    setDistributing(true);
    try {
      const result = await distributeUnassignedClients();
      onNotify(result.message, result.assigned > 0 ? "success" : "error");
      await loadClients();
    } catch (error) {
      onNotify(
        error instanceof Error
          ? error.message
          : "No se pudieron asignar los clientes pendientes.",
        "error",
      );
    } finally {
      setDistributing(false);
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Clientes"
        description={
          isAdmin
            ? "Cartera completa del cotizador: leads del cotizador y registros manuales de ejecutivos."
            : "Tu cartera de clientes: agrega personas que captaste por tu cuenta y gestiona los leads que te asignen."
        }
        actions={
          <>
            <AdminRefreshButton onClick={() => void loadClients()} />
            <Button size="sm" variant="success" onClick={() => setCreateModalOpen(true)}>
              <IconUserPlus className="mr-1.5 size-4" />
              Agregar cliente
            </Button>
            {isAdmin && unassignedCount > 0 ? (
              <Button
                size="sm"
                variant="warning"
                disabled={distributing}
                onClick={() => void handleDistributeUnassigned()}
              >
                {distributing
                  ? "Asignando…"
                  : `Asignar pendientes (${unassignedCount})`}
              </Button>
            ) : null}
          </>
        }
      />

      {!isAdmin && assignedLeadCount > 0 ? (
        <p className={executiveLeadBannerClass()}>
          Tienes{" "}
          <span className="font-semibold">{assignedLeadCount}</span>{" "}
          {assignedLeadCount === 1 ? "lead del cotizador" : "leads del cotizador"}{" "}
          en tu cartera. El color de la etiqueta indica desde qué
          cotizador provienen.
        </p>
      ) : null}

      <AdminToolbar>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, correo, teléfono o RUT…"
          className={joinClasses("h-11", ui.input)}
        />
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredClients.length === 0}
        emptyTitle="Aún no tienes clientes"
        emptyDescription={
          isAdmin
            ? "Los clientes aparecerán cuando soliciten cotizaciones o cuando un ejecutivo los registre manualmente."
            : "Agrega clientes que captaste por tu cuenta o espera leads asignados desde el cotizador."
        }
        loadingMessage="Cargando clientes…"
        footer={`Mostrando ${filteredClients.length} de ${clients.length} clientes.`}
      >
        <AdminTable minWidth={isAdmin ? "72rem" : "64rem"}>
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Origen</AdminTableHeaderCell>
              {isAdmin ? (
                <AdminTableHeaderCell>Cotizador</AdminTableHeaderCell>
              ) : null}
              <AdminTableHeaderCell>Plan</AdminTableHeaderCell>
              <AdminTableHeaderCell>Contacto</AdminTableHeaderCell>
              <AdminTableHeaderCell>RUT</AdminTableHeaderCell>
              {isAdmin ? (
                <AdminTableHeaderCell>Ejecutivo</AdminTableHeaderCell>
              ) : null}
              <AdminTableHeaderCell>Registro</AdminTableHeaderCell>
              <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredClients.map((client) => (
              <AdminTableRow key={client.id}>
                <AdminTableCell className="min-w-[11rem]">
                  <TableCellStack>
                    <p className="font-semibold leading-tight text-foreground">
                      {client.fullName}
                    </p>
                    <ClientPipelineStatusBadge status={client.pipelineStatus} />
                  </TableCellStack>
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <TableCellStack>
                    <ClientOriginBadge
                      origin={client.clientOrigin}
                      cotizadorSource={client.cotizadorSource}
                    />
                  </TableCellStack>
                </AdminTableCell>
                {isAdmin ? (
                  <AdminTableCell className="min-w-[8rem]">
                    <CotizadorSourceBadge
                      source={client.cotizadorSource}
                      compact
                    />
                  </AdminTableCell>
                ) : null}
                <AdminTableCell className="min-w-[12rem]">
                  <ClientPlanSummary
                    requestedPlan={client.requestedPlan}
                    advisedPlan={client.advisedPlan}
                    compact
                  />
                </AdminTableCell>
                <AdminTableCell className="min-w-[10rem]">
                  <TableCellStack>
                    <p className="truncate text-sm leading-tight">{client.email}</p>
                    <p className="text-xs leading-tight text-muted">
                      {client.phone ?? "Sin teléfono"}
                    </p>
                  </TableCellStack>
                </AdminTableCell>
                <AdminTableCell className="whitespace-nowrap">
                  <TableCellStack>
                    <span className="font-mono text-sm tabular-nums">
                      {client.rut ?? "—"}
                    </span>
                  </TableCellStack>
                </AdminTableCell>
                {isAdmin ? (
                  <AdminTableCell className="min-w-[11rem]">
                    <TableCellStack>
                      <select
                        value={client.assignedExecutiveId ?? ""}
                        disabled={savingId === client.id}
                        onChange={(event) => {
                          const value = event.target.value;
                          void handleAssignExecutive(client, value || null);
                        }}
                        className={joinClasses(
                          "h-9 w-full min-w-[10rem] rounded-lg px-2 text-sm",
                          ui.input,
                        )}
                        aria-label={`Asignar ejecutivo a ${client.fullName}`}
                      >
                        <option value="">Sin asignar</option>
                        {executives.map((executive) => (
                          <option key={executive.id} value={executive.id}>
                            {executive.fullName}
                          </option>
                        ))}
                      </select>
                    </TableCellStack>
                  </AdminTableCell>
                ) : null}
                <AdminTableCell className="whitespace-nowrap">
                  <TableCellStack>
                    <span className="text-sm tabular-nums">
                      {formatDate(client.createdAt)}
                    </span>
                  </TableCellStack>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminRowActions className="flex-nowrap">
                    {client.phone ? (
                      <a
                        href={buildWhatsAppUrl(
                          client.phone,
                          buildClientWhatsAppMessage(client.fullName),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="whatsapp">
                          <IconWhatsApp className="mr-1.5 size-3.5" />
                          WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="ghost" disabled className="opacity-50">
                        <IconWhatsApp className="mr-1.5 size-3.5" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setPipelineClient(client)}
                    >
                      <IconSettings className="mr-1.5 size-3.5" />
                      Gestionar
                    </Button>
                  </AdminRowActions>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      <CreateClientModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(created) => {
          setClients((current) => [created, ...current]);
        }}
        onNotify={onNotify}
      />

      <ClientPipelineDrawer
        client={pipelineClient}
        open={Boolean(pipelineClient)}
        onClose={() => setPipelineClient(null)}
        onUpdated={(updated) => {
          setClients((current) =>
            current.map((row) => (row.id === updated.id ? updated : row)),
          );
          setPipelineClient(updated);
        }}
        onNotify={onNotify}
      />
    </AdminPanel>
  );
}
