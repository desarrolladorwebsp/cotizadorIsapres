"use client";

import { useEffect, useRef, useState } from "react";
import { buildBeneficiaryGroupSummary, parseBeneficiaryAge } from "@/domain";
import {
  createDefaultQuoteCriteria,
  REGION_OPTIONS,
  type QuoteCriteria,
} from "@/lib/quote-criteria-options";
import { criteriaBar, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/domain";

export type { QuoteCriteria } from "@/lib/quote-criteria-options";
export { createDefaultQuoteCriteria } from "@/lib/quote-criteria-options";

export interface PublicQuoteCriteriaBarProps {
  criteria: QuoteCriteria;
  onCriteriaChange: (patch: Partial<QuoteCriteria>) => void;
  beneficiaries: FamilyBeneficiariesState;
  onBeneficiariesChange: (
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) => void;
  onCalculate: () => void;
  onResetAll?: () => void;
  /** Abre el panel de cargas cuando vienen prellenadas desde la URL. */
  showPreloadedDependents?: boolean;
}

const fieldClass = joinClasses(
  "h-11 w-full rounded-xl border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-border/80 focus:ring-2 focus:ring-primary/40",
);

export function PublicQuoteCriteriaBar({
  criteria,
  onCriteriaChange,
  beneficiaries,
  onBeneficiariesChange,
  onCalculate,
  onResetAll,
  showPreloadedDependents = false,
}: PublicQuoteCriteriaBarProps) {
  const [ageInput, setAgeInput] = useState(
    beneficiaries.contributorAge !== null
      ? String(beneficiaries.contributorAge)
      : "",
  );
  const [insuredOpen, setInsuredOpen] = useState(showPreloadedDependents);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAgeInput(
      beneficiaries.contributorAge !== null
        ? String(beneficiaries.contributorAge)
        : "",
    );
  }, [beneficiaries.contributorAge]);

  useEffect(() => {
    if (showPreloadedDependents && beneficiaries.dependents.length > 0) {
      setInsuredOpen(true);
    }
  }, [showPreloadedDependents, beneficiaries.dependents.length]);

  useEffect(() => {
    if (!insuredOpen) return;
    function handleClick(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setInsuredOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [insuredOpen]);

  function emit(next: FamilyBeneficiariesState) {
    onBeneficiariesChange(next, buildBeneficiaryGroupSummary(next));
  }

  function updateAge(raw: string) {
    setAgeInput(raw);
    emit({
      ...beneficiaries,
      contributorAge: parseBeneficiaryAge(raw),
    });
  }

  function addDependent() {
    const id = crypto.randomUUID();
    emit({
      ...beneficiaries,
      dependents: [...beneficiaries.dependents, { id, age: null }],
    });
  }

  function updateDependentAge(id: string, raw: string) {
    emit({
      ...beneficiaries,
      dependents: beneficiaries.dependents.map((d) =>
        d.id === id ? { ...d, age: parseBeneficiaryAge(raw) } : d,
      ),
    });
  }

  function removeDependent(id: string) {
    emit({
      ...beneficiaries,
      dependents: beneficiaries.dependents.filter((d) => d.id !== id),
    });
  }

  const insuredCount = 1 + beneficiaries.dependents.length;

  return (
    <section className={criteriaBar}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.2fr_5rem_auto_auto_auto] lg:items-end lg:gap-4">
        <div className="space-y-1.5">
          <label htmlFor="qc-region" className="text-xs font-semibold text-muted">
            Región
          </label>
          <select
            id="qc-region"
            value={criteria.region}
            onChange={(e) => onCriteriaChange({ region: e.target.value })}
            className={fieldClass}
          >
            <option value="">Selecciona...</option>
            {REGION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qc-income" className="text-xs font-semibold text-muted">
            Ingreso mensual líquido
          </label>
          <input
            id="qc-income"
            type="text"
            inputMode="numeric"
            placeholder="Ej: $1.200.000"
            value={criteria.monthlyIncome}
            onChange={(e) =>
              onCriteriaChange({ monthlyIncome: e.target.value })
            }
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qc-age" className="text-xs font-semibold text-muted">
            Edad
          </label>
          <input
            id="qc-age"
            type="number"
            min={18}
            max={120}
            value={ageInput}
            onChange={(e) => updateAge(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setInsuredOpen((v) => !v)}
            className={joinClasses(
              touchTarget,
              "h-11 w-full gap-2 rounded-xl border border-dashed border-primary/40 bg-white px-4 text-sm font-semibold text-primary-dark transition hover:bg-primary/5 lg:w-auto",
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Agregar asegurados
            {insuredCount > 1 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                {insuredCount}
              </span>
            ) : null}
          </button>

          {insuredOpen ? (
            <div
              className={joinClasses(
                "absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border bg-white p-4 shadow-xl",
                ui.border,
              )}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                Cargas familiares
              </p>
              <ul className="space-y-2">
                {beneficiaries.dependents.map((dep, index) => (
                  <li key={dep.id} className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={120}
                      placeholder={`Edad carga ${index + 1}`}
                      value={dep.age !== null ? String(dep.age) : ""}
                      onChange={(e) =>
                        updateDependentAge(dep.id, e.target.value)
                      }
                      className={joinClasses("h-10 flex-1 rounded-lg px-3 text-sm", ui.input)}
                    />
                    <button
                      type="button"
                      onClick={() => removeDependent(dep.id)}
                      className="text-xs font-semibold text-accent-danger"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addDependent}
                className="mt-3 text-sm font-semibold text-primary"
              >
                + Añadir carga
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onCalculate}
          className={joinClasses(
            touchTarget,
            "h-11 rounded-full px-8 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition hover:brightness-105 sm:col-span-2 lg:col-span-1",
            ui.cta,
          )}
        >
          Buscar mejor plan
        </button>

        {onResetAll ? (
          <button
            type="button"
            onClick={onResetAll}
            className={joinClasses(
              touchTarget,
              "h-11 rounded-full border px-5 text-sm font-semibold sm:col-span-2 lg:col-span-1",
              ui.border,
              "bg-white text-muted transition hover:border-primary/35 hover:bg-surface-hover hover:text-primary-dark",
            )}
          >
            Limpiar todo
          </button>
        ) : null}
      </div>
    </section>
  );
}
