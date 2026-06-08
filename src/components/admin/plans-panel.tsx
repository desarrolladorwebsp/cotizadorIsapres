"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createEmptyPlan,
  createPlan,
  deletePlan,
  updatePlan,
} from "@/lib/api/admin-client";
import { formatPlanUf } from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { Clinic } from "@/domain";
import type { HealthPlan } from "@/domain";
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
            <h2 className="text-base font-bold text-primary-dark">Planes</h2>
            <p className="text-sm text-muted">{plans.length} en catálogo</p>
          </div>
          <Button size="sm" onClick={openCreateForm}>
            Nuevo plan
          </Button>
        </div>

        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, código o Isapre…"
          className={joinClasses("h-11", ui.input)}
        />

        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Cargando planes…</p>
        ) : filteredPlans.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted">
            No hay planes que coincidan con la búsqueda.
          </p>
        ) : (
          <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {filteredPlans.map((plan) => (
              <li key={plan.unique_code}>
                <button
                  type="button"
                  onClick={() => openEditForm(plan)}
                  className={joinClasses(
                    "w-full rounded-lg border px-4 py-3 text-left transition",
                    draftPlan.unique_code === plan.unique_code && formMode === "edit"
                      ? "border-primary bg-primary/5"
                      : joinClasses(ui.borderHairline, ui.hoverSurface),
                  )}
                >
                  <p className="truncate text-sm font-semibold text-primary-dark">
                    {plan.plan_name}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-muted">
                    {plan.unique_code}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>{plan.isapre}</span>
                    <span>·</span>
                    <span className="tabular-nums">
                      {formatPlanUf(plan.base_price_uf)}
                    </span>
                    <span>·</span>
                    <span>{plan.coverage.length} coberturas</span>
                    {plan.pdf_url ? (
                      <>
                        <span>·</span>
                        <span>PDF</span>
                      </>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
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
                onClick={() => handleDelete(draftPlan)}
              >
                Eliminar
              </Button>
            ) : null}
          </div>

          <PlanForm
            initialValue={draftPlan}
            clinics={clinics}
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
                onClick={() => handleDelete(draftPlan)}
              >
                Eliminar plan
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
            Selecciona un plan o crea uno nuevo
          </p>
          <p className="mt-2 max-w-md text-sm text-muted">
            Desde aquí puedes editar precios base, notas y coberturas por
            prestador.
          </p>
          <Button className="mt-6" onClick={openCreateForm}>
            Crear primer plan
          </Button>
        </div>
      )}
    </div>
  );
}
