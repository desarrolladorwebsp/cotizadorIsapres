"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AdminFormModal,
  AdminPanel,
  AdminPanelHeader,
  AdminRefreshButton,
  AdminRowActions,
  AdminBadge,
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
  createClinic,
  createEmptyClinic,
  deleteClinic,
  updateClinic,
} from "@/lib/api/admin-client";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { Clinic, HealthPlan } from "@/domain";
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
    <AdminPanel>
      <AdminPanelHeader
        title="Clínicas y prestadores"
        description="Prestadores reutilizables al configurar coberturas en los planes de salud."
        actions={
          <>
            <AdminRefreshButton onClick={() => void onRefresh()} />
            <Button size="sm" onClick={openCreateForm}>
              Agregar clínica
            </Button>
          </>
        }
      />

      <AdminToolbar className="lg:grid-cols-[minmax(0,1fr)_12rem]">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o identificador…"
          className={joinClasses("h-11", ui.input)}
        />
        <div className="flex items-center rounded-xl border bg-bg-layout/50 px-4 text-sm text-muted">
          <span className="font-semibold text-foreground">{clinics.length}</span>
          <span className="ml-1">prestadores</span>
        </div>
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredClinics.length === 0}
        emptyTitle="No hay clínicas para mostrar"
        emptyDescription="Agrega un prestador o ajusta la búsqueda."
        loadingMessage="Cargando clínicas…"
        footer={`Mostrando ${filteredClinics.length} de ${clinics.length} prestadores.`}
      >
        <AdminTable minWidth="52rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Nombre</AdminTableHeaderCell>
              <AdminTableHeaderCell>Identificador</AdminTableHeaderCell>
              <AdminTableHeaderCell align="center">Coberturas</AdminTableHeaderCell>
              <AdminTableHeaderCell align="center">Zonas</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredClinics.map((clinic) => {
              const usage = countUsage(plans, clinic.id);

              return (
                <AdminTableRow
                  key={clinic.id}
                  selected={formMode === "edit" && draftClinic.id === clinic.id}
                >
                  <AdminTableCell>
                    <p className="font-semibold text-foreground">{clinic.name}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <code className="rounded bg-bg-layout px-1.5 py-0.5 font-mono text-xs text-muted">
                      {clinic.id}
                    </code>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <AdminBadge tone={usage > 0 ? "info" : "neutral"}>
                      {usage}
                    </AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell align="center">
                    <AdminBadge tone="primary">{clinic.zones?.length ?? 0}</AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell align="right">
                    <AdminRowActions>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditForm(clinic)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        disabled={usage > 0}
                        onClick={() => void handleDelete(clinic)}
                      >
                        Eliminar
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
        open={formMode !== null}
        title={formMode === "create" ? "Nueva clínica" : "Editar clínica"}
        description={
          formMode === "edit"
            ? `Identificador: ${draftClinic.id}`
            : "El identificador se usa en las coberturas de los planes."
        }
        onClose={closeForm}
        size="md"
      >
        <ClinicForm
          initialValue={draftClinic}
          isEditing={formMode === "edit"}
          saving={saving}
          embedded
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      </AdminFormModal>
    </AdminPanel>
  );
}
