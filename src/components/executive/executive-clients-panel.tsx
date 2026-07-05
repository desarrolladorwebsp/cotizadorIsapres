"use client";

import { useEffect, useMemo, useState } from "react";
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
import { fetchExecutiveClients } from "@/lib/api/admin-client";
import { useStaffSession } from "@/hooks/use-auth-session";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadClients() {
    setLoading(true);
    try {
      setClients(await fetchExecutiveClients());
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
  }, []);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;

    return clients.filter((client) =>
      [client.fullName, client.email, client.phone, client.rut]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [clients, search]);

  return (
    <AdminPanel>
      <AdminPanelHeader
        title={isAdmin ? "Clientes del cotizador" : "Clientes asignados"}
        description={
          isAdmin
            ? "Todos los clientes registrados en el cotizador público y su ejecutivo asignado."
            : "Personas vinculadas a tu cuenta. Contacta directamente desde los datos registrados."
        }
        actions={<AdminRefreshButton onClick={() => void loadClients()} />}
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
        <AdminTable minWidth="48rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Cliente</AdminTableHeaderCell>
              <AdminTableHeaderCell>Contacto</AdminTableHeaderCell>
              <AdminTableHeaderCell>RUT</AdminTableHeaderCell>
              {isAdmin ? (
                <AdminTableHeaderCell>Ejecutivo asignado</AdminTableHeaderCell>
              ) : null}
              <AdminTableHeaderCell>Registro</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredClients.map((client) => (
              <AdminTableRow key={client.id}>
                <AdminTableCell>
                  <p className="font-semibold text-foreground">{client.fullName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {client.active ? "Activo" : "Inactivo"}
                  </p>
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
                    {client.assignedExecutiveName ?? (
                      <span className="text-muted">Sin asignar</span>
                    )}
                  </AdminTableCell>
                ) : null}
                <AdminTableCell>{formatDate(client.createdAt)}</AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>
    </AdminPanel>
  );
}
