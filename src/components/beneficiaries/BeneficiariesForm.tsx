"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { buildBeneficiaryGroupSummary, parseBeneficiaryAge } from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { formatDependentsCountLabel } from "@/lib/beneficiary-display";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/domain";
import { DependentLoadsEditor } from "./dependent-loads-editor";
import { FactorBadge } from "./factor-badge";

export interface BeneficiariesFormProps {
  value: FamilyBeneficiariesState;
  onChange: (
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) => void;
  className?: string;
  /** Oculta textos de ayuda del formulario (panel ejecutivo). */
  hideHelperText?: boolean;
  /** Estilo plano para el panel lateral ejecutivo. */
  executiveVisual?: boolean;
}

export function BeneficiariesForm({
  value,
  onChange,
  className,
  hideHelperText = false,
  executiveVisual = false,
}: BeneficiariesFormProps) {
  const [contributorInput, setContributorInput] = useState(
    value.contributorAge !== null ? String(value.contributorAge) : "",
  );
  const [justConfirmed, setJustConfirmed] = useState(false);

  const summary = useMemo(
    () => buildBeneficiaryGroupSummary(value),
    [value],
  );

  const confirmedDependents = useMemo(
    () => value.dependents.filter((dependent) => dependent.age !== null),
    [value.dependents],
  );

  const parsedDraftAge = parseBeneficiaryAge(contributorInput);
  const canConfirmAge = parsedDraftAge !== null && parsedDraftAge <= 120;
  const isAgeCommitted =
    value.contributorAge !== null &&
    contributorInput.trim() === String(value.contributorAge);
  const ageActionLabel =
    value.contributorAge !== null && !isAgeCommitted ? "Actualizar" : "Agregar";

  useEffect(() => {
    setContributorInput(
      value.contributorAge !== null ? String(value.contributorAge) : "",
    );
  }, [value.contributorAge]);

  useEffect(() => {
    if (!justConfirmed) return;
    const timer = window.setTimeout(() => setJustConfirmed(false), 1600);
    return () => window.clearTimeout(timer);
  }, [justConfirmed]);

  function emit(next: FamilyBeneficiariesState) {
    onChange(next, buildBeneficiaryGroupSummary(next));
  }

  function confirmContributorAge() {
    if (!canConfirmAge || parsedDraftAge === null) return;
    setContributorInput(String(parsedDraftAge));
    emit({
      ...value,
      contributorAge: parsedDraftAge,
      dependents: confirmedDependents,
    });
    setJustConfirmed(true);
  }

  function handleDependentsChange(
    nextDependents: FamilyBeneficiariesState["dependents"],
  ) {
    emit({
      ...value,
      dependents: nextDependents,
    });
  }

  return (
    <section
      className={joinClasses(
        executiveVisual ? undefined : ui.surfaceCard,
        executiveVisual ? "p-0" : "p-5 sm:p-6",
        className,
      )}
    >
      <header className={joinClasses("space-y-1", executiveVisual ? "mb-4" : "mb-6")}>
        <h2
          className={joinClasses(
            executiveVisual
              ? "rounded-lg border-l-[3px] border-l-primary bg-primary/12 px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-primary-dark shadow-sm ring-1 ring-primary/15"
              : joinClasses("text-sm font-bold tracking-tight", ui.sectionTitle),
          )}
        >
          Beneficiarios
        </h2>
        {!hideHelperText ? (
          <p className="text-xs leading-relaxed text-muted">
            Cotizante y cargas según Tabla Única de Factores N°604.
          </p>
        ) : null}
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="contributor-age"
              className="text-xs font-medium uppercase tracking-wide text-primary-dark/80"
            >
              Cotizante principal
            </label>
            <div className="flex items-center gap-2">
              {isAgeCommitted || justConfirmed ? (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-dark"
                  aria-live="polite"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="size-3" aria-hidden>
                    <path
                      d="M3.5 8.5 6.5 11.5 12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Agregado
                </span>
              ) : (
                <span className="text-[10px] text-muted/80">Obligatorio · 1</span>
              )}
            </div>
          </div>

          <div
            className={joinClasses(
              "flex items-center gap-2",
              !executiveVisual && joinClasses("rounded-lg px-3 py-2.5", ui.borderHairline),
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
              onChange={(event) => {
                setJustConfirmed(false);
                setContributorInput(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  confirmContributorAge();
                }
              }}
              className={joinClasses(
                "h-12 w-full min-w-0 flex-1 rounded-lg px-3 text-base tabular-nums md:h-10 md:text-sm",
                ui.input,
                isAgeCommitted && "ring-2 ring-primary/30",
              )}
            />
            <button
              type="button"
              onClick={confirmContributorAge}
              disabled={!canConfirmAge || isAgeCommitted}
              aria-label={`${ageActionLabel} edad del cotizante`}
              className={joinClasses(
                touchTarget,
                "h-12 shrink-0 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 md:h-10",
                isAgeCommitted
                  ? "bg-primary/10 text-primary-dark"
                  : canConfirmAge
                    ? ui.cta
                    : joinClasses(ui.border, "bg-white text-muted"),
              )}
            >
              {isAgeCommitted ? (
                <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
                  <path
                    d="M3.5 8.5 6.5 11.5 12.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                ageActionLabel
              )}
            </button>
            <FactorBadge factor={summary.contributor.factor} />
          </div>
          {!hideHelperText ? (
            <p className="text-[11px] text-muted">
              Escribe la edad y pulsa Agregar para recalcular los precios de los planes.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-dark/80">
              Cargas familiares
            </p>
            <span className="text-[10px] font-medium text-primary-dark/80">
              {formatDependentsCountLabel(confirmedDependents.length)}
            </span>
          </div>

          <DependentLoadsEditor
            dependents={confirmedDependents}
            onDependentsChange={handleDependentsChange}
            dependentFactors={summary.dependents}
            variant="form"
            hideEmptyHint={hideHelperText}
          />
        </div>

        <motion.div
          layout="position"
          className={joinClasses(
            executiveVisual
              ? "rounded-lg bg-surface-hover/50 px-3 py-3"
              : "rounded-lg border border-primary/20 bg-primary/5 px-4 py-4",
          )}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-dark/70">
                Resumen del grupo
              </p>
              <p className="text-sm text-foreground">
                <span className="font-bold tabular-nums text-primary-dark">
                  {summary.beneficiaryCount}
                </span>{" "}
                {summary.beneficiaryCount === 1
                  ? "beneficiario"
                  : "beneficiarios"}
              </p>
              {confirmedDependents.length > 0 ? (
                <p className="text-[11px] leading-snug text-muted">
                  Cargas:{" "}
                  {confirmedDependents
                    .map((dependent) => `${dependent.age} años`)
                    .join(" · ")}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary-dark/70">
                Factor total
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-primary-dark">
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
