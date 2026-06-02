"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { buildBeneficiaryGroupSummary } from "@/lib/beneficiary-summary";
import { parseBeneficiaryAge } from "@/lib/risk-factor-table-604";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/types/beneficiary";
import { FactorBadge } from "./factor-badge";

export interface BeneficiariesFormProps {
  value: FamilyBeneficiariesState;
  onChange: (
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) => void;
  className?: string;
}

const listItemTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BeneficiariesForm({
  value,
  onChange,
  className,
}: BeneficiariesFormProps) {
  const [contributorInput, setContributorInput] = useState(
    value.contributorAge !== null ? String(value.contributorAge) : "",
  );
  const [dependentInputs, setDependentInputs] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        value.dependents.map((d) => [
          d.id,
          d.age !== null ? String(d.age) : "",
        ]),
      ),
  );

  const summary = useMemo(
    () => buildBeneficiaryGroupSummary(value),
    [value],
  );

  useEffect(() => {
    setContributorInput(
      value.contributorAge !== null ? String(value.contributorAge) : "",
    );
    setDependentInputs(
      Object.fromEntries(
        value.dependents.map((d) => [
          d.id,
          d.age !== null ? String(d.age) : "",
        ]),
      ),
    );
  }, [value.contributorAge, value.dependents]);

  function emit(next: FamilyBeneficiariesState) {
    onChange(next, buildBeneficiaryGroupSummary(next));
  }

  function handleContributorInputChange(raw: string) {
    setContributorInput(raw);
    const next: FamilyBeneficiariesState = {
      ...value,
      contributorAge: parseBeneficiaryAge(raw),
    };
    emit(next);
  }

  function handleDependentInputChange(id: string, raw: string) {
    setDependentInputs((prev) => ({ ...prev, [id]: raw }));
    const next: FamilyBeneficiariesState = {
      ...value,
      dependents: value.dependents.map((dependent) =>
        dependent.id === id
          ? { ...dependent, age: parseBeneficiaryAge(raw) }
          : dependent,
      ),
    };
    emit(next);
  }

  function addDependent() {
    const id = crypto.randomUUID();
    const next: FamilyBeneficiariesState = {
      ...value,
      dependents: [...value.dependents, { id, age: null }],
    };
    setDependentInputs((prev) => ({ ...prev, [id]: "" }));
    emit(next);
  }

  function removeDependent(id: string) {
    const next: FamilyBeneficiariesState = {
      ...value,
      dependents: value.dependents.filter((dependent) => dependent.id !== id),
    };
    setDependentInputs((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    emit(next);
  }

  return (
    <section className={joinClasses(ui.card, "p-5 sm:p-6", className)}>
      <header className="mb-6 space-y-1">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Beneficiarios
        </h2>
        <p className="text-xs leading-relaxed text-muted">
          Cotizante y cargas según Tabla Única de Factores N°604.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="contributor-age"
              className="text-xs font-medium uppercase tracking-wide text-muted"
            >
              Cotizante principal
            </label>
            <span className="text-[10px] text-muted/80">Obligatorio · 1</span>
          </div>

          <div
            className={joinClasses(
              "flex items-center gap-3 rounded-lg px-3 py-2.5",
              ui.borderHairline,
            )}
          >
            <input
              id="contributor-age"
              type="number"
              min={0}
              max={120}
              inputMode="numeric"
              placeholder="Edad"
              value={contributorInput}
              onChange={(event) =>
                handleContributorInputChange(event.target.value)
              }
              className={joinClasses(
                "h-9 w-full min-w-0 flex-1 rounded-lg px-3 text-sm tabular-nums",
                ui.input,
              )}
            />
            <FactorBadge factor={summary.contributor.factor} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Cargas familiares
            </p>
            <span className="text-[10px] text-muted/80">
              {value.dependents.length} registrada
              {value.dependents.length === 1 ? "" : "s"}
            </span>
          </div>

          {value.dependents.length === 0 ? (
            <p className="text-xs text-muted/80">
              Sin cargas agregadas. Usa el botón inferior para añadir una.
            </p>
          ) : null}

          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {value.dependents.map((dependent, index) => {
                const personFactor = summary.dependents.find(
                  (p) => p.id === dependent.id,
                );

                return (
                  <motion.li
                    key={dependent.id}
                    layout
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98, height: 0 }}
                    transition={listItemTransition}
                    className="overflow-hidden"
                  >
                    <div
                      className={joinClasses(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5",
                        ui.borderHairline,
                      )}
                    >
                      <span className="w-5 shrink-0 text-xs font-medium text-muted">
                        {index + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        inputMode="numeric"
                        placeholder="Edad"
                        aria-label={`Edad carga ${index + 1}`}
                        value={dependentInputs[dependent.id] ?? ""}
                        onChange={(event) =>
                          handleDependentInputChange(
                            dependent.id,
                            event.target.value,
                          )
                        }
                        className={joinClasses(
                          "h-9 min-w-0 flex-1 rounded-lg px-3 text-sm tabular-nums",
                          ui.input,
                        )}
                      />
                      <FactorBadge factor={personFactor?.factor ?? null} />
                      <button
                        type="button"
                        onClick={() => removeDependent(dependent.id)}
                        aria-label={`Eliminar carga ${index + 1}`}
                        className={joinClasses(
                          "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition",
                          ui.borderHairline,
                          ui.hoverSurface,
                        )}
                      >
                        <RemoveIcon />
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <button
            type="button"
            onClick={addDependent}
            className={joinClasses(
              "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-brand transition",
              ui.borderHairline,
              ui.hoverSurface,
            )}
          >
            <PlusIcon />
            Añadir carga
          </button>
        </div>

        <motion.div
          layout
          className={joinClasses(
            "rounded-lg px-4 py-4",
            ui.borderHairline,
            "bg-[hsl(var(--surface-hover)/0.5)]",
          )}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Resumen del grupo
              </p>
              <p className="text-sm text-foreground">
                <span className="font-semibold tabular-nums">
                  {summary.personCount}
                </span>{" "}
                {summary.personCount === 1 ? "persona" : "personas"} en el grupo
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Factor total
              </p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {summary.totalFactors.toLocaleString("es-CL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
