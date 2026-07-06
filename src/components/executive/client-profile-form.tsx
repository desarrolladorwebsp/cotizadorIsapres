"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildEmptyDependent,
  MARITAL_STATUS_OPTIONS,
  splitFullName,
} from "@/lib/client-profile/constants";
import { sanitizeRutInput } from "@/lib/auth/rut";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { ClientDependentProfile } from "@/types/client-profile";

export interface ClientProfileFormValue {
  email: string;
  phone: string;
  rut: string;
  firstNames: string;
  lastNames: string;
  birthDate: string;
  currentIsapre: string;
  heightCm: string;
  weightKg: string;
  maritalStatus: string;
  address: string;
  commune: string;
  dependents: ClientDependentProfile[];
}

export function buildEmptyClientProfileFormValue(): ClientProfileFormValue {
  return {
    email: "",
    phone: "",
    rut: "",
    firstNames: "",
    lastNames: "",
    birthDate: "",
    currentIsapre: "",
    heightCm: "",
    weightKg: "",
    maritalStatus: "",
    address: "",
    commune: "",
    dependents: [],
  };
}

export interface ClientProfileFormProps {
  value: ClientProfileFormValue;
  onChange: (value: ClientProfileFormValue) => void;
  showEmail?: boolean;
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="text-xs text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function ClientProfileForm({
  value,
  onChange,
  showEmail = true,
}: ClientProfileFormProps) {
  function updateField<K extends keyof ClientProfileFormValue>(
    field: K,
    fieldValue: ClientProfileFormValue[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
  }

  function updateDependent(
    dependentId: string,
    field: keyof ClientDependentProfile,
    fieldValue: string,
  ) {
    onChange({
      ...value,
      dependents: value.dependents.map((dependent) =>
        dependent.id === dependentId
          ? { ...dependent, [field]: fieldValue }
          : dependent,
      ),
    });
  }

  function addDependent() {
    onChange({
      ...value,
      dependents: [...value.dependents, buildEmptyDependent()],
    });
  }

  function removeDependent(dependentId: string) {
    onChange({
      ...value,
      dependents: value.dependents.filter(
        (dependent) => dependent.id !== dependentId,
      ),
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-border bg-bg-layout/30 p-4">
        <SectionTitle
          title="Datos del titular"
          description="Información personal y de contacto que el ejecutivo registra para la gestión."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {showEmail ? (
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-medium">Correo electrónico *</span>
              <Input
                type="email"
                required
                value={value.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="cliente@gmail.com"
              />
            </label>
          ) : null}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Celular</span>
            <Input
              value={value.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+56912345678"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">RUT titular</span>
            <Input
              value={value.rut}
              onChange={(event) =>
                updateField("rut", sanitizeRutInput(event.target.value))
              }
              placeholder="12345678-9"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Nombres *</span>
            <Input
              required
              value={value.firstNames}
              onChange={(event) => updateField("firstNames", event.target.value)}
              placeholder="María"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Apellidos *</span>
            <Input
              required
              value={value.lastNames}
              onChange={(event) => updateField("lastNames", event.target.value)}
              placeholder="Pérez González"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Fecha de nacimiento</span>
            <Input
              type="date"
              value={value.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Isapre actual</span>
            <Input
              value={value.currentIsapre}
              onChange={(event) =>
                updateField("currentIsapre", event.target.value)
              }
              placeholder="Ej. Consalud"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Estatura (cm)</span>
            <Input
              value={value.heightCm}
              onChange={(event) => updateField("heightCm", event.target.value)}
              placeholder="170"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Peso (kg)</span>
            <Input
              value={value.weightKg}
              onChange={(event) => updateField("weightKg", event.target.value)}
              placeholder="70"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Estado civil legal</span>
            <select
              value={value.maritalStatus}
              onChange={(event) =>
                updateField("maritalStatus", event.target.value)
              }
              className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
            >
              <option value="">Seleccionar…</option>
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium">Dirección particular</span>
            <Input
              value={value.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Calle, número, depto."
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium">Comuna</span>
            <Input
              value={value.commune}
              onChange={(event) => updateField("commune", event.target.value)}
              placeholder="Ej. Las Condes"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-bg-layout/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Cargas familiares"
            description="Agrega cada carga con sus datos básicos."
          />
          <Button type="button" variant="info" size="sm" onClick={addDependent}>
            Agregar carga
          </Button>
        </div>

        {value.dependents.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted">
            Sin cargas registradas. Usa &quot;Agregar carga&quot; si el cliente tiene
            dependientes.
          </p>
        ) : (
          <div className="space-y-3">
            {value.dependents.map((dependent, index) => (
              <div
                key={dependent.id}
                className="rounded-xl border border-border bg-white p-3 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Carga {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDependent(dependent.id)}
                  >
                    Quitar
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">RUT carga</span>
                    <Input
                      value={dependent.rut}
                      onChange={(event) =>
                        updateDependent(
                          dependent.id,
                          "rut",
                          sanitizeRutInput(event.target.value),
                        )
                      }
                      placeholder="12345678-9"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Fecha de nacimiento</span>
                    <Input
                      type="date"
                      value={dependent.birthDate}
                      onChange={(event) =>
                        updateDependent(
                          dependent.id,
                          "birthDate",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Estatura (cm)</span>
                    <Input
                      value={dependent.heightCm}
                      onChange={(event) =>
                        updateDependent(
                          dependent.id,
                          "heightCm",
                          event.target.value,
                        )
                      }
                      placeholder="120"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium">Peso (kg)</span>
                    <Input
                      value={dependent.weightKg}
                      onChange={(event) =>
                        updateDependent(
                          dependent.id,
                          "weightKg",
                          event.target.value,
                        )
                      }
                      placeholder="25"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function userRecordToProfileFormValue(
  user?: {
    email?: string;
    phone?: string | null;
    rut?: string | null;
    fullName?: string;
    clientProfile?: {
      firstNames?: string;
      lastNames?: string;
      birthDate?: string;
      currentIsapre?: string;
      heightCm?: string;
      weightKg?: string;
      maritalStatus?: string;
      address?: string;
      commune?: string;
      dependents?: ClientDependentProfile[];
    };
  } | null,
): ClientProfileFormValue {
  const profile = user?.clientProfile;
  const fromName = splitFullName(user?.fullName);
  return {
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    rut: user?.rut ?? "",
    firstNames: profile?.firstNames || fromName.firstNames,
    lastNames: profile?.lastNames || fromName.lastNames,
    birthDate: profile?.birthDate ?? "",
    currentIsapre: profile?.currentIsapre ?? "",
    heightCm: profile?.heightCm ?? "",
    weightKg: profile?.weightKg ?? "",
    maritalStatus: profile?.maritalStatus ?? "",
    address: profile?.address ?? "",
    commune: profile?.commune ?? "",
    dependents: profile?.dependents ?? [],
  };
}
