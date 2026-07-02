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
  fetchStaffAccounts,
  resendStaffInvite,
  updateStaffAccount,
} from "@/lib/api/admin-client";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  CreateStaffAccountInput,
  PendingStaffInviteRecord,
  StaffAccountRecord,
  StaffRealm,
} from "@/types/staff-account";

export interface UsersPanelProps {
  onNotify: (message: string, tone?: "success" | "error") => void;
}

const REALM_LABELS: Record<StaffRealm, string> = {
  admin: "Administrador",
  executive: "Ejecutivo",
};

const STAFF_REALMS = new Set<StaffRealm>(["admin", "executive"]);

type StaffDirectoryRow =
  | { kind: "account"; account: StaffAccountRecord; sortAt: string }
  | { kind: "invite"; invite: PendingStaffInviteRecord; sortAt: string };

function isStaffRealm(realm: string): realm is StaffRealm {
  return STAFF_REALMS.has(realm as StaffRealm);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsersPanel({ onNotify }: UsersPanelProps) {
  const [accounts, setAccounts] = useState<StaffAccountRecord[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingStaffInviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [realmFilter, setRealmFilter] = useState<StaffRealm | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<CreateStaffAccountInput>({
    realm: "executive",
    email: "",
    rut: "",
    subscriptionStatus: "TRIAL",
  });

  async function loadAccounts() {
    setLoading(true);
    try {
      const data = await fetchStaffAccounts();
      setAccounts(data.accounts.filter((account) => isStaffRealm(account.realm)));
      setPendingInvites(
        data.pendingInvites.filter((invite) => isStaffRealm(invite.realm)),
      );
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudieron cargar los usuarios.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccounts();
  }, []);

  const directoryRows = useMemo(() => {
    const rows: StaffDirectoryRow[] = [
      ...accounts.map(
        (account): StaffDirectoryRow => ({
          kind: "account",
          account,
          sortAt: account.createdAt,
        }),
      ),
      ...pendingInvites.map(
        (invite): StaffDirectoryRow => ({
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
      const realm = row.kind === "account" ? row.account.realm : row.invite.realm;
      if (realmFilter !== "all" && realm !== realmFilter) return false;
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
  }, [directoryRows, search, realmFilter]);

  function openModal() {
    setDraft({
      realm: "executive",
      email: "",
      rut: "",
      subscriptionStatus: "TRIAL",
    });
    setModalOpen(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await createStaffAccount({
        realm: draft.realm,
        email: draft.email.trim(),
        rut: draft.rut?.trim() || undefined,
        subscriptionStatus:
          draft.realm === "executive" ? draft.subscriptionStatus : undefined,
      });

      onNotify(result.message);
      setModalOpen(false);
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo crear el usuario.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(account: StaffAccountRecord) {
    try {
      await updateStaffAccount(account.realm, account.id, {
        active: !account.active,
      });
      onNotify(
        account.active ? "Usuario desactivado." : "Usuario activado.",
      );
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo actualizar el usuario.",
        "error",
      );
    }
  }

  async function handleResendInvite(account: StaffAccountRecord) {
    try {
      const result = await resendStaffInvite(account.realm, account.id);
      onNotify(result.message);
      await loadAccounts();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo reenviar la clave.",
        "error",
      );
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Usuarios staff"
        description="Solo cuentas con rol Administrador o Ejecutivo. Los clientes del cotizador no aparecen aquí."
        actions={
          <>
            <AdminRefreshButton onClick={() => void loadAccounts()} />
            <Button size="sm" onClick={openModal}>
              Agregar usuario
            </Button>
          </>
        }
      />

      <AdminToolbar className="lg:grid-cols-[minmax(0,1fr)_12rem]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, correo o teléfono…"
          className={joinClasses("h-11", ui.input)}
        />
        <select
          value={realmFilter}
          onChange={(event) =>
            setRealmFilter(event.target.value as StaffRealm | "all")
          }
          className={joinClasses("h-11 rounded-xl px-3 text-sm", ui.input)}
        >
          <option value="all">Administrador y ejecutivo</option>
          <option value="admin">Solo administradores</option>
          <option value="executive">Solo ejecutivos</option>
        </select>
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredRows.length === 0}
        emptyTitle="No hay usuarios staff para mostrar"
        emptyDescription="Invita un administrador o ejecutivo con el botón Agregar usuario."
        loadingMessage="Cargando usuarios…"
        footer={`Mostrando ${filteredRows.length} de ${directoryRows.length} usuarios (administrador o ejecutivo).`}
      >
        <AdminTable minWidth="56rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Usuario</AdminTableHeaderCell>
              <AdminTableHeaderCell>Rol</AdminTableHeaderCell>
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
                      <p className="font-semibold text-foreground">
                        {invite.email}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Invitación enviada {formatDate(invite.createdAt)}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge tone="primary">
                        {REALM_LABELS[invite.realm]}
                      </AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <p>{invite.email}</p>
                      {invite.rut ? (
                        <p className="mt-1 text-xs text-muted">
                          RUT {invite.rut}
                        </p>
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
                      <span className="text-xs text-muted">Esperando activación</span>
                    </AdminTableCell>
                  </AdminTableRow>
                );
              }

              const { account } = row;

              return (
                <AdminTableRow key={`${account.realm}-${account.id}`}>
                  <AdminTableCell>
                    <p className="font-semibold text-foreground">
                      {account.fullName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Creado {formatDate(account.createdAt)}
                    </p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge tone="primary">
                      {REALM_LABELS[account.realm]}
                    </AdminBadge>
                    {account.realm === "executive" &&
                    account.subscriptionStatus ? (
                      <p className="mt-2 text-xs text-muted">
                        {account.subscriptionStatus}
                      </p>
                    ) : null}
                  </AdminTableCell>
                  <AdminTableCell>
                    <p>{account.email}</p>
                    {account.phone ? (
                      <p className="mt-1 text-xs text-muted">{account.phone}</p>
                    ) : null}
                    {account.rut ? (
                      <p className="mt-1 text-xs text-muted">
                        RUT {account.rut}
                      </p>
                    ) : null}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="space-y-2">
                      <AdminBadge tone={account.active ? "success" : "neutral"}>
                        {account.active ? "Activo" : "Inactivo"}
                      </AdminBadge>
                      {account.mustChangePassword ? (
                        <p className="text-xs font-medium text-amber-700">
                          Debe cambiar clave
                        </p>
                      ) : null}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="text-muted">
                    {formatDate(account.lastLoginAt)}
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <AdminRowActions>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleResendInvite(account)}
                      >
                        Reenviar invitación
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={account.active ? "danger" : "ghost"}
                        onClick={() => void handleToggleActive(account)}
                      >
                        {account.active ? "Desactivar" : "Activar"}
                      </Button>
                    </AdminRowActions>
                  </AdminTableCell>
                </AdminTableRow>
              );
            })}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      <AdminFormModal
        open={modalOpen}
        title="Invitar usuario"
        description="Se enviará un enlace al correo. La persona completará nombre, apellido, RUT y contraseña."
        onClose={() => setModalOpen(false)}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleCreate}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Tipo de cuenta</span>
            <select
              value={draft.realm}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  realm: event.target.value as StaffRealm,
                }))
              }
              className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
            >
              <option value="admin">Administrador</option>
              <option value="executive">Ejecutivo</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Correo</span>
            <Input
              type="email"
              required
              value={draft.email}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">RUT (opcional en invitación)</span>
            <Input
              value={draft.rut ?? ""}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  rut: event.target.value,
                }))
              }
              placeholder="12.345.678-9"
            />
            <p className="text-xs text-muted">
              Si lo registras aquí, deberá coincidir al activar la cuenta.
            </p>
          </label>

          {draft.realm === "executive" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium">Suscripción</span>
              <select
                value={draft.subscriptionStatus ?? "TRIAL"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    subscriptionStatus: event.target
                      .value as CreateStaffAccountInput["subscriptionStatus"],
                  }))
                }
                className={joinClasses(
                  "h-11 w-full rounded-xl px-3 text-sm",
                  ui.input,
                )}
              >
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Activa</option>
              </select>
            </label>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enviando..." : "Enviar invitación"}
            </Button>
          </div>
        </form>
      </AdminFormModal>
    </AdminPanel>
  );
}
