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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [realmFilter, setRealmFilter] = useState<StaffRealm | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<CreateStaffAccountInput>({
    realm: "admin",
    email: "",
    fullName: "",
    phone: "",
    rut: "",
    subscriptionStatus: "TRIAL",
  });

  async function loadAccounts() {
    setLoading(true);
    try {
      const nextAccounts = await fetchStaffAccounts();
      setAccounts(nextAccounts);
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

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      if (realmFilter !== "all" && account.realm !== realmFilter) return false;
      if (!query) return true;

      return [account.fullName, account.email, account.phone, account.rut]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [accounts, search, realmFilter]);

  function openModal() {
    setDraft({
      realm: "admin",
      email: "",
      fullName: "",
      phone: "",
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
        fullName: draft.fullName.trim(),
        phone: draft.phone?.trim() || undefined,
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
        title="Usuarios del sistema"
        description="Cuentas de administradores y ejecutivos. Se envía una clave temporal al correo y el usuario debe cambiarla al ingresar."
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
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="executive">Ejecutivos</option>
        </select>
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredAccounts.length === 0}
        emptyTitle="No hay usuarios para mostrar"
        loadingMessage="Cargando usuarios…"
        footer={`Mostrando ${filteredAccounts.length} de ${accounts.length} usuarios.`}
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
            {filteredAccounts.map((account) => (
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
                    <p className="mt-1 text-xs text-muted">RUT {account.rut}</p>
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
                      Reenviar clave
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
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      <AdminFormModal
        open={modalOpen}
        title="Agregar usuario"
        description="Se enviará una clave temporal al correo indicado."
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
            <span className="text-sm font-medium">Nombre completo</span>
            <Input
              required
              value={draft.fullName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
            />
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

          {draft.realm === "executive" ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Teléfono</span>
                <Input
                  value={draft.phone ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium">RUT</span>
                <Input
                  value={draft.rut ?? ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rut: event.target.value,
                    }))
                  }
                />
              </label>

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
            </>
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
              {saving ? "Creando..." : "Crear y enviar clave"}
            </Button>
          </div>
        </form>
      </AdminFormModal>
    </AdminPanel>
  );
}
