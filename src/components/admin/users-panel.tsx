"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminBadge,
  AdminFormModal,
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
import {
  createStaffAccount,
  deleteStaffAccount,
  fetchStaffAccounts,
  resendPendingStaffInvite,
  updateStaffAccount,
} from "@/lib/api/admin-client";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  PendingStaffInviteRecord,
  StaffAccountRecord,
} from "@/types/staff-account";

export interface UsersPanelProps {
  onNotify: (message: string, tone?: "success" | "error") => void;
  /** Si true, muestra solo ejecutivos (vista principal de Usuarios). */
  executivesOnly?: boolean;
  /** Si false, oculta acciones de gestión (invitar, suspender, eliminar). */
  canManage?: boolean;
}

type ExecutiveDirectoryRow =
  | { kind: "account"; account: StaffAccountRecord; sortAt: string }
  | { kind: "invite"; invite: PendingStaffInviteRecord; sortAt: string };

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getExecutiveStatus(account: StaffAccountRecord): {
  label: string;
  tone: "success" | "warning" | "neutral";
} {
  if (!account.active) {
    return { label: "Usuario suspendido", tone: "neutral" };
  }
  if (!account.onboardingCompleted) {
    return { label: "Perfil pendiente", tone: "warning" };
  }
  if (account.assignmentsSuspended) {
    return { label: "Sin nuevas asignaciones", tone: "warning" };
  }
  return { label: "Activo", tone: "success" };
}

export function UsersPanel({
  onNotify,
  executivesOnly = true,
  canManage = true,
}: UsersPanelProps) {
  const [accounts, setAccounts] = useState<StaffAccountRecord[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingStaffInviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffAccountRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ email: "", rut: "" });

  async function loadAccounts() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchStaffAccounts();
      const filteredAccounts = executivesOnly
        ? data.accounts.filter((account) => account.realm === "executive")
        : data.accounts;
      const filteredInvites = executivesOnly
        ? data.pendingInvites.filter((invite) => invite.realm === "executive")
        : data.pendingInvites;

      setAccounts(filteredAccounts);
      setPendingInvites(filteredInvites);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar los usuarios.";
      setLoadError(message);
      setAccounts([]);
      setPendingInvites([]);
      onNotify(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, [executivesOnly]);

  const directoryRows = useMemo(() => {
    const rows: ExecutiveDirectoryRow[] = [
      ...accounts.map(
        (account): ExecutiveDirectoryRow => ({
          kind: "account",
          account,
          sortAt: account.createdAt,
        }),
      ),
      ...pendingInvites.map(
        (invite): ExecutiveDirectoryRow => ({
          kind: "invite",
          invite,
          sortAt: invite.createdAt,
        }),
      ),
    ];

    return rows.sort(
      (a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
    );
  }, [accounts, pendingInvites]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return directoryRows.filter((row) => {
      if (!query) return true;

      const values =
        row.kind === "account"
          ? [
              row.account.fullName,
              row.account.email,
              row.account.phone,
              row.account.rut,
            ]
          : [row.invite.email, row.invite.rut];

      return values
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [directoryRows, search]);

  function openModal() {
    setDraft({ email: "", rut: "" });
    setModalOpen(true);
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await createStaffAccount({
        realm: "executive",
        email: draft.email.trim(),
        rut: draft.rut.trim(),
      });

      onNotify(result.message);
      setModalOpen(false);
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo enviar la invitación.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAssignments(account: StaffAccountRecord) {
    try {
      await updateStaffAccount(account.realm, account.id, {
        assignmentsSuspended: !account.assignmentsSuspended,
      });
      onNotify(
        account.assignmentsSuspended
          ? "El ejecutivo volverá a recibir nuevas solicitudes."
          : "Asignaciones suspendidas. El ejecutivo conserva acceso al panel.",
      );
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo actualizar el usuario.",
        "error",
      );
    }
  }

  async function handleToggleActive(account: StaffAccountRecord) {
    try {
      await updateStaffAccount(account.realm, account.id, {
        active: !account.active,
      });
      onNotify(
        account.active
          ? "Usuario suspendido. Ya no puede ingresar al sistema."
          : "Usuario reactivado.",
      );
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo actualizar el usuario.",
        "error",
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      const result = await deleteStaffAccount(deleteTarget.realm, deleteTarget.id);
      onNotify(result.message);
      setDeleteTarget(null);
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo eliminar el usuario.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResendPendingInvite(inviteId: string) {
    try {
      const result = await resendPendingStaffInvite(inviteId);
      onNotify(result.message);
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo reenviar la invitación.",
        "error",
      );
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Usuarios"
        description="Ejecutivos que reciben solicitudes de clientes. La invitación por correo es el único medio para crear un usuario en el sistema."
        actions={
          <>
            <AdminRefreshButton onClick={() => void loadAccounts()} />
            {canManage ? (
              <Button size="sm" onClick={openModal}>
                Invitar ejecutivo
              </Button>
            ) : null}
          </>
        }
      />

      <AdminToolbar>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, correo, RUT o teléfono…"
          className={joinClasses("h-11", ui.input)}
        />
      </AdminToolbar>

      {loadError ? (
        <div
          className={joinClasses(
            "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
          )}
        >
          {loadError}
        </div>
      ) : null}

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredRows.length === 0}
        emptyTitle="No hay ejecutivos registrados"
        emptyDescription="Invita a un ejecutivo con su RUT y correo electrónico."
        loadingMessage="Cargando usuarios…"
        footer={`Mostrando ${filteredRows.length} de ${directoryRows.length} registros.`}
      >
        <AdminTable minWidth="56rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Ejecutivo</AdminTableHeaderCell>
              <AdminTableHeaderCell>Contacto</AdminTableHeaderCell>
              <AdminTableHeaderCell>Estado</AdminTableHeaderCell>
              <AdminTableHeaderCell>Último acceso</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredRows.map((row) => {
              if (row.kind === "invite") {
                const { invite } = row;

                return (
                  <AdminTableRow key={`invite-${invite.id}`}>
                    <AdminTableCell>
                      <p className="font-semibold text-foreground">{invite.email}</p>
                      <p className="mt-1 text-xs text-muted">
                        Invitación enviada {formatDate(invite.createdAt)}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p>{invite.email}</p>
                      {invite.rut ? (
                        <p className="mt-1 text-xs text-muted">RUT {invite.rut}</p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge tone="warning">Invitación pendiente</AdminBadge>
                      <p className="mt-2 text-xs text-muted">
                        Expira {formatDate(invite.expiresAt)}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell className="text-muted">—</AdminTableCell>
                    <AdminTableCell align="right">
                      {canManage ? (
                        <AdminRowActions>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleResendPendingInvite(invite.id)}
                          >
                            Reenviar invitación
                          </Button>
                        </AdminRowActions>
                      ) : (
                        <span className="text-xs text-muted">Esperando activación</span>
                      )}
                    </AdminTableCell>
                  </AdminTableRow>
                );
              }

              const { account } = row;
              const status = getExecutiveStatus(account);

              return (
                <AdminTableRow key={account.id}>
                  <AdminTableCell>
                    <p className="font-semibold text-foreground">
                      {account.fullName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Registrado {formatDate(account.createdAt)}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <p>{account.email}</p>
                    {account.phone ? (
                      <p className="mt-1 text-xs text-muted">{account.phone}</p>
                    ) : null}
                    {account.rut ? (
                      <p className="mt-1 text-xs text-muted">RUT {account.rut}</p>
                    ) : null}
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell className="text-muted">
                    {formatDate(account.lastLoginAt)}
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    {canManage ? (
                      <AdminRowActions>
                        {account.active && account.onboardingCompleted ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void handleToggleAssignments(account)}
                          >
                            {account.assignmentsSuspended
                              ? "Reanudar asignaciones"
                              : "Suspender asignaciones"}
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant={account.active ? "ghost" : "secondary"}
                          onClick={() => void handleToggleActive(account)}
                        >
                          {account.active ? "Suspender usuario" : "Reactivar usuario"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(account)}
                        >
                          Eliminar
                        </Button>
                      </AdminRowActions>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      {canManage ? (
        <AdminFormModal
          open={modalOpen}
          title="Invitar ejecutivo"
        description="Se enviará un correo con un enlace único. La persona deberá validar su RUT y crear su contraseña."
        onClose={() => setModalOpen(false)}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleInvite}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Correo electrónico</span>
            <Input
              type="email"
              required
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">RUT</span>
            <Input
              required
              value={draft.rut}
              onChange={(event) =>
                setDraft((current) => ({ ...current, rut: event.target.value }))
              }
              placeholder="12.345.678-9"
            />
            <p className="text-xs text-muted">
              Deberá coincidir al activar la cuenta desde el enlace del correo.
            </p>
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enviando…" : "Enviar invitación"}
            </Button>
          </div>
        </form>
      </AdminFormModal>
      ) : null}

      {canManage ? (
        <AdminFormModal
          open={Boolean(deleteTarget)}
          title="Eliminar ejecutivo"
        description={
          deleteTarget
            ? `¿Eliminar permanentemente a ${deleteTarget.fullName}? Esta acción no se puede deshacer.`
            : ""
        }
        onClose={() => setDeleteTarget(null)}
        size="md"
      >
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={saving}
            onClick={() => void handleDelete()}
          >
            {saving ? "Eliminando…" : "Eliminar definitivamente"}
          </Button>
        </div>
      </AdminFormModal>
      ) : null}
    </AdminPanel>
  );
}
