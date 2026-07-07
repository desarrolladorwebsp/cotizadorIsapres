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
}

export function BeneficiariesForm({
  value,
  onChange,
  className,
}: BeneficiariesFormProps) {
  const [contributorInput, setContributorInput] = useState(
    value.contributorAge !== null ? String(value.contributorAge) : "",
  );

  const summary = useMemo(
    () => buildBeneficiaryGroupSummary(value),
    [value],
  );

  const confirmedDependents = useMemo(
    () => value.dependents.filter((dependent) => dependent.age !== null),
    [value.dependents],
  );

  useEffect(() => {
    setContributorInput(
      value.contributorAge !== null ? String(value.contributorAge) : "",
    );
  }, [value.contributorAge]);

  function emit(next: FamilyBeneficiariesState) {
    onChange(next, buildBeneficiaryGroupSummary(next));
  }

  function handleContributorInputChange(raw: string) {
    setContributorInput(raw);
    emit({
      ...value,
      contributorAge: parseBeneficiaryAge(raw),
      dependents: confirmedDependents,
    });
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
    <section className={joinClasses(ui.surfaceCard, "p-5 sm:p-6", className)}>
      <header className="mb-6 space-y-1">
        <h2 className={joinClasses("text-sm font-bold tracking-tight", ui.sectionTitle)}>
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
                "h-12 w-full min-w-0 flex-1 rounded-lg px-3 text-base tabular-nums md:h-10 md:text-sm",
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
            <span className="text-[10px] font-medium text-primary-dark/80">
              {formatDependentsCountLabel(confirmedDependents.length)}
            </span>
          </div>

          <DependentLoadsEditor
            dependents={confirmedDependents}
            onDependentsChange={handleDependentsChange}
            dependentFactors={summary.dependents}
            variant="form"
          />
        </div>

        <motion.div
          layout="position"
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4"
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
                  : "beneficiarios"}{" "}
                (prima GES)
              </p>
              {confirmedDependents.length > 0 ? (
                <p className="text-[11px] leading-snug text-muted">
                  Cargas:{" "}
                  {confirmedDependents
                    .map((dependent) => `${dependent.age} años`)
                    .join(" · ")}
                </p>
              ) : null}
              <p className="text-[11px] leading-snug text-muted">
                Menores de 2 años: factor 0 (Circular N°343)
              </p>
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
