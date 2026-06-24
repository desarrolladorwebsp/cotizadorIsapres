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
  createEmptyPlan,
  createPlan,
  deletePlan,
  updatePlan,
} from "@/lib/api/admin-client";
import { formatPlanUf } from "@/domain";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { Clinic, HealthPlan } from "@/domain";
import { PlanForm } from "./plan-form";

export interface PlansPanelProps {
  plans: HealthPlan[];
  clinics: Clinic[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onNotify: (message: string, tone?: "success" | "error") => void;
}

type FormMode = "create" | "edit" | null;

export function PlansPanel({
  plans,
  clinics,
  loading,
  onRefresh,
  onNotify,
}: PlansPanelProps) {
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [draftPlan, setDraftPlan] = useState<HealthPlan>(createEmptyPlan());
  const [saving, setSaving] = useState(false);

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return plans;

    return plans.filter(
      (plan) =>
        plan.plan_name.toLowerCase().includes(query) ||
        plan.unique_code.toLowerCase().includes(query) ||
        plan.isapre.toLowerCase().includes(query),
    );
  }, [plans, search]);

  function openCreateForm() {
    setDraftPlan(createEmptyPlan());
    setFormMode("create");
  }

  function openEditForm(plan: HealthPlan) {
    setDraftPlan(plan);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
  }

  async function handleSave(plan: HealthPlan) {
    setSaving(true);
    try {
      if (formMode === "create") {
        await createPlan(plan);
        onNotify("Plan creado correctamente.");
      } else {
        await updatePlan(plan);
        onNotify("Plan actualizado correctamente.");
      }
      await onRefresh();
      closeForm();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo guardar el plan.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(plan: HealthPlan) {
    const confirmed = window.confirm(
      `¿Eliminar el plan "${plan.plan_name}"? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    try {
      await deletePlan(plan.unique_code);
      onNotify("Plan eliminado.");
      if (formMode === "edit" && draftPlan.unique_code === plan.unique_code) {
        closeForm();
      }
      await onRefresh();
    } catch (error) {
      onNotify(
        error instanceof Error ? error.message : "No se pudo eliminar el plan.",
        "error",
      );
    }
  }

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Planes de salud"
        description="Catálogo de planes del cotizador. Edita precios, coberturas por prestador y documentos PDF."
        actions={
          <>
            <AdminRefreshButton onClick={() => void onRefresh()} />
            <Button size="sm" onClick={openCreateForm}>
              Agregar plan
            </Button>
          </>
        }
      />

      <AdminToolbar className="lg:grid-cols-[minmax(0,1fr)_12rem]">
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, código o Isapre…"
          className={joinClasses("h-11", ui.input)}
        />
        <div className="flex items-center rounded-xl border bg-bg-layout/50 px-4 text-sm text-muted">
          <span className="font-semibold text-foreground">{plans.length}</span>
          <span className="ml-1">planes en catálogo</span>
        </div>
      </AdminToolbar>

      <AdminTableCard
        loading={loading}
        empty={!loading && filteredPlans.length === 0}
        emptyTitle="No hay planes para mostrar"
        emptyDescription="Crea un plan nuevo o ajusta la búsqueda."
        loadingMessage="Cargando planes…"
        footer={`Mostrando ${filteredPlans.length} de ${plans.length} planes.`}
      >
        <AdminTable minWidth="64rem">
          <AdminTableHead>
            <tr>
              <AdminTableHeaderCell>Plan</AdminTableHeaderCell>
              <AdminTableHeaderCell>Código</AdminTableHeaderCell>
              <AdminTableHeaderCell>Isapre</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Precio base</AdminTableHeaderCell>
              <AdminTableHeaderCell align="center">Coberturas</AdminTableHeaderCell>
              <AdminTableHeaderCell align="center">PDF</AdminTableHeaderCell>
              <AdminTableHeaderCell align="right">Acciones</AdminTableHeaderCell>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filteredPlans.map((plan) => (
              <AdminTableRow
                key={plan.unique_code}
                selected={formMode === "edit" && draftPlan.unique_code === plan.unique_code}
              >
                <AdminTableCell>
                  <p className="font-semibold text-foreground">{plan.plan_name}</p>
                  {plan.has_top ? (
                    <p className="mt-1 text-xs text-muted">Incluye TOP</p>
                  ) : null}
                </AdminTableCell>
                <AdminTableCell>
                  <code className="rounded bg-bg-layout px-1.5 py-0.5 font-mono text-xs text-muted">
                    {plan.unique_code}
                  </code>
                </AdminTableCell>
                <AdminTableCell>{plan.isapre}</AdminTableCell>
                <AdminTableCell align="right">
                  <span className="tabular-nums font-semibold text-foreground">
                    {formatPlanUf(plan.base_price_uf)}
                  </span>
                </AdminTableCell>
                <AdminTableCell align="center">
                  <AdminBadge tone="neutral">{plan.coverage.length}</AdminBadge>
                </AdminTableCell>
                <AdminTableCell align="center">
                  {plan.pdf_url ? (
                    <AdminBadge tone="success">Sí</AdminBadge>
                  ) : (
                    <AdminBadge tone="warning">No</AdminBadge>
                  )}
                </AdminTableCell>
                <AdminTableCell align="right">
                  <AdminRowActions>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditForm(plan)}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => void handleDelete(plan)}
                    >
                      Eliminar
                    </Button>
                  </AdminRowActions>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </AdminTableCard>

      <AdminFormModal
        open={formMode !== null}
        title={formMode === "create" ? "Nuevo plan de salud" : "Editar plan de salud"}
        description={
          formMode === "create"
            ? "Completa los datos del plan y sus coberturas por prestador."
            : `Código: ${draftPlan.unique_code}`
        }
        onClose={closeForm}
        size="xl"
      >
        <PlanForm
          initialValue={draftPlan}
          clinics={clinics}
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
