"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminBadge,
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
  assignClientToExecutive,
  distributeUnassignedClients,
  fetchExecutiveAccounts,
  fetchExecutiveClients,
} from "@/lib/api/admin-client";
import { useStaffSession } from "@/hooks/use-auth-session";
import { ClientPipelineDrawer } from "@/components/executive/client-pipeline-drawer";
import { ClientPipelineStatusBadge } from "@/components/executive/client-pipeline-status-badge";
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
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los clientes asignados.",
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
      [client.fullName, client.email, client.phone, client.rut]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clients, search]);

  const unassignedCount = useMemo(
    () => clients.filter((client) => !client.assignedExecutiveId).length,
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
        title={isAdmin ? "Clientes del cotizador" : "Clientes asignados"}
        description={
          isAdmin
            ? "Clientes del cotizador público y widget. La asignación a ejecutivos es automática (round-robin 1×1) o manual si falla."
            : "Personas vinculadas a tu cuenta. Contacta directamente desde los datos registrados."
        }
        actions={
          <>
            <AdminRefreshButton onClick={() => void loadClients()} />
            {isAdmin && unassignedCount > 0 ? (
              <Button
                size="sm"
                variant="secondary"
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
        emptyTitle={
          isAdmin ? "No hay clientes registrados" : "No tienes clientes asignados"
        }
        emptyDescription={
          isAdmin
            ? "Los clientes aparecerán aquí cuando soliciten cotizaciones."
            : "Cuando el administrador te asigne clientes, aparecerán en esta lista."
        }
        loadingMessage="Cargando clientes…"
        footer={`Mostrando ${filteredClients.length} de ${clients.length} clientes.`}
      >
        <AdminTable minWidth="52rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Contacto</AdminTableHeaderCell>
              <AdminTableHeaderCell>RUT</AdminTableHeaderCell>
              {isAdmin ? (
                <AdminTableHeaderCell>Ejecutivo asignado</AdminTableHeaderCell>
              ) : null}
              <AdminTableHeaderCell>Registro</AdminTableHeaderCell>
              <AdminTableHeaderCell>Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredClients.map((client) => (
              <AdminTableRow key={client.id}>
                <AdminTableCell>
                  <p className="font-semibold text-foreground">{client.fullName}</p>
                  <div className="mt-1">
                    <ClientPipelineStatusBadge status={client.pipelineStatus} />
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <p>{client.email}</p>
                  {client.phone ? (
                    <p className="mt-1 text-xs text-muted">{client.phone}</p>
                  ) : null}
                </AdminTableCell>
                <AdminTableCell>{client.rut ?? "—"}</AdminTableCell>
                {isAdmin ? (
                  <AdminTableCell>
                    {client.assignedExecutiveName ? (
                      <AdminBadge tone="info">
                        {client.assignedExecutiveName}
                      </AdminBadge>
                    ) : (
                      <AdminBadge tone="warning">Sin asignar</AdminBadge>
                    )}
                    <select
                      value={client.assignedExecutiveId ?? ""}
                      disabled={savingId === client.id}
                      onChange={(event) => {
                        const value = event.target.value;
                        void handleAssignExecutive(client, value || null);
                      }}
                      className={joinClasses(
                        "mt-2 h-9 w-full min-w-[10rem] rounded-lg px-2 text-xs",
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
                  </AdminTableCell>
                ) : null}
                <AdminTableCell>{formatDate(client.createdAt)}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-2">
                    {client.phone ? (
                      <a
                        href={buildWhatsAppUrl(
                          client.phone,
                          buildClientWhatsAppMessage(client.fullName),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="secondary">
                          WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="secondary" disabled>
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setPipelineClient(client)}
                    >
                      Gestionar
                    </Button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      <ClientPipelineDrawer
        client={pipelineClient}
        open={Boolean(pipelineClient)}
        onClose={() => setPipelineClient(null)}
        onUpdated={(updated) => {
          setClients((current) =>
            current.map((row) => (row.id === updated.id ? updated : row)),
          );
        }}
        onNotify={onNotify}
      />
    </AdminPanel>
  );
}
