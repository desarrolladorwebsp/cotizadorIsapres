"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createClinic,
  createEmptyClinic,
  deleteClinic,
  updateClinic,
} from "@/lib/api/admin-client";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { Clinic } from "@/domain";
import type { HealthPlan } from "@/domain";
import { ClinicForm } from "./clinic-form";

export interface ClinicsPanelProps {
  clinics: Clinic[];
  plans: HealthPlan[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

type FormMode = "create" | "edit" | null;

function countUsage(plans: HealthPlan[], clinicId: string): number {
  return plans.reduce(
    (total, plan) =>
      total +
      plan.coverage.filter((entry) => entry.clinic_id === clinicId).length,
    0,
  );
}

export function ClinicsPanel({
  clinics,
  plans,
  loading,
  onRefresh,
  onNotify,
}: ClinicsPanelProps) {
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [draftClinic, setDraftClinic] = useState<Clinic>(createEmptyClinic());
  const [saving, setSaving] = useState(false);

  const filteredClinics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clinics;

    return clinics.filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(query) ||
        clinic.id.toLowerCase().includes(query),
    );
  }, [clinics, search]);

  function openCreateForm() {
    setDraftClinic(createEmptyClinic());
    setFormMode("create");
  }

  function openEditForm(clinic: Clinic) {
    setDraftClinic(clinic);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
  }

  async function handleSave(clinic: Clinic) {
    setSaving(true);
    try {
      if (formMode === "create") {
        await createClinic(clinic);
        onNotify("Clínica creada correctamente.");
      } else {
        await updateClinic(clinic);
        onNotify("Clínica actualizada. Los planes vinculados se sincronizaron.");
      }
      await onRefresh();
      closeForm();
    } catch (error) {
      onNotify(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la clínica.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(clinic: Clinic) {
    const usage = countUsage(plans, clinic.id);
    if (usage > 0) {
      onNotify(
        `No se puede eliminar: está asociada a ${usage} cobertura(s).`,
        "error",
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar la clínica "${clinic.name}"?`,
    );
    if (!confirmed) return;

    try {
      await deleteClinic(clinic.id);
      onNotify("Clínica eliminada.");
      if (formMode === "edit" && draftClinic.id === clinic.id) {
        closeForm();
      }
      await onRefresh();
    } catch (error) {
      onNotify(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la clínica.",
        "error",
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
      <section
        className={joinClasses(
          "space-y-4 rounded-xl border bg-white p-4 shadow-card sm:p-5",
          ui.border,
          formMode ? "hidden lg:block" : "",
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-primary-dark">Clínicas</h2>
            <p className="text-sm text-muted">{clinics.length} prestadores</p>
          </div>
          <Button size="sm" onClick={openCreateForm}>
            Nueva clínica
          </Button>
        </div>

        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o identificador…"
          className={joinClasses("h-11", ui.input)}
        />

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">
            Cargando clínicas…
          </p>
        ) : filteredClinics.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted">
            No hay clínicas que coincidan con la búsqueda.
          </p>
        ) : (
          <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {filteredClinics.map((clinic) => {
              const usage = countUsage(plans, clinic.id);

              return (
                <li key={clinic.id}>
                  <button
                    type="button"
                    onClick={() => openEditForm(clinic)}
                    className={joinClasses(
                      "w-full rounded-lg border px-4 py-3 text-left transition",
                      draftClinic.id === clinic.id && formMode === "edit"
                        ? "border-primary bg-primary/5"
                        : joinClasses(ui.borderHairline, ui.hoverSurface),
                    )}
                  >
                    <p className="truncate text-sm font-semibold text-primary-dark">
                      {clinic.name}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-muted">
                      {clinic.id}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Usada en {usage} cobertura{usage === 1 ? "" : "s"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {formMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between lg:hidden">
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              ← Volver al listado
            </Button>
            {formMode === "edit" ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDelete(draftClinic)}
              >
                Eliminar
              </Button>
            ) : null}
          </div>

          <ClinicForm
            initialValue={draftClinic}
            isEditing={formMode === "edit"}
            saving={saving}
            onSubmit={handleSave}
            onCancel={closeForm}
          />

          {formMode === "edit" ? (
            <div className="hidden justify-end lg:flex">
              <Button
                type="button"
                variant="danger"
                className={touchTarget}
                onClick={() => handleDelete(draftClinic)}
              >
                Eliminar clínica
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={joinClasses(
            "hidden rounded-xl border border-dashed bg-white px-6 py-16 text-center lg:flex lg:flex-col lg:items-center lg:justify-center",
            ui.border,
          )}
        >
          <p className="text-base font-medium text-foreground">
            Selecciona una clínica o crea una nueva
          </p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Los prestadores se reutilizan al configurar coberturas en los planes.
          </p>
          <Button className="mt-6" onClick={openCreateForm}>
            Crear prestador
          </Button>
        </div>
      )}
    </div>
  );
}
