"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStaffAccount,
  fetchStaffAccounts,
  resendStaffInvite,
  updateStaffAccount,
} from "@/lib/api/admin-client";
import { touchTarget, ui } from "@/lib/ui-tokens";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary-dark">
            Usuarios del sistema
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Crea cuentas de administradores y ejecutivos. Se envía una clave
            temporal al correo y el usuario debe cambiarla al ingresar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadAccounts()}
            className={joinClasses(
              touchTarget,
              "rounded-lg px-4 text-sm font-semibold",
              ui.ctaOutline,
            )}
          >
            Actualizar
          </button>
          <Button onClick={openModal}>Agregar usuario</Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem]">
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
      </div>

      <div
        className={joinClasses(
          "overflow-hidden rounded-2xl border bg-white shadow-sm",
          ui.border,
        )}
      >
        {loading ? (
          <p className="px-6 py-16 text-center text-sm text-muted">
            Cargando usuarios…
          </p>
        ) : filteredAccounts.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">
            No hay usuarios para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[56rem] w-full text-left text-sm">
              <thead className="border-b bg-bg-layout/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Rol</th>
                  <th className="px-4 py-3 font-semibold">Contacto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Último acceso</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    key={`${account.realm}-${account.id}`}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-foreground">
                        {account.fullName}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Creado {formatDate(account.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-dark">
                        {REALM_LABELS[account.realm]}
                      </span>
                      {account.realm === "executive" &&
                      account.subscriptionStatus ? (
                        <p className="mt-2 text-xs text-muted">
                          {account.subscriptionStatus}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p>{account.email}</p>
                      {account.phone ? (
                        <p className="mt-1 text-xs text-muted">{account.phone}</p>
                      ) : null}
                      {account.rut ? (
                        <p className="mt-1 text-xs text-muted">RUT {account.rut}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <span
                          className={joinClasses(
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            account.active
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-zinc-100 text-zinc-600",
                          )}
                        >
                          {account.active ? "Activo" : "Inactivo"}
                        </span>
                        {account.mustChangePassword ? (
                          <p className="text-xs font-medium text-amber-700">
                            Debe cambiar clave
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-muted">
                      {formatDate(account.lastLoginAt)}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleResendInvite(account)}
                          className={joinClasses(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold",
                            ui.ctaOutline,
                          )}
                        >
                          Reenviar clave
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(account)}
                          className={joinClasses(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold",
                            ui.hoverSurface,
                          )}
                        >
                          {account.active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div
            className={joinClasses(
              "w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl",
              ui.border,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3
                  id="create-user-title"
                  className="text-lg font-bold text-primary-dark"
                >
                  Agregar usuario
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Se enviará una clave temporal al correo indicado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-bg-layout"
              >
                Cerrar
              </button>
            </div>

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
          </div>
        </div>
      ) : null}
    </div>
  );
}
