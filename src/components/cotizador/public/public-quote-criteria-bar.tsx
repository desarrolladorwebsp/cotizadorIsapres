"use client";

import { useEffect, useRef, useState } from "react";
import { buildBeneficiaryGroupSummary, parseBeneficiaryAge } from "@/domain";
import { DependentLoadsEditor } from "@/components/beneficiaries/dependent-loads-editor";
import {
  createDefaultQuoteCriteria,
  REGION_OPTIONS,
  type QuoteCriteria,
} from "@/lib/quote-criteria-options";
import {
  formatBeneficiariesBarSummary,
  getConfirmedDependents,
} from "@/lib/beneficiary-display";
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
  /** Vista compacta para widget embebido en móvil. */
  compactEmbed?: boolean;
  /** Abre el panel de cargas cuando vienen prellenadas desde la URL. */
  showPreloadedDependents?: boolean;
}

const fieldClass = joinClasses(
  "h-11 w-full rounded-xl border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-border/80 focus:ring-2 focus:ring-primary/40",
);

const compactFieldClass =
  "max-md:h-9 max-md:rounded-lg max-md:px-2.5 max-md:text-xs";

export function PublicQuoteCriteriaBar({
  criteria,
  onCriteriaChange,
  beneficiaries,
  onBeneficiariesChange,
  onCalculate,
  onResetAll,
  compactEmbed = false,
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
    if (showPreloadedDependents && getConfirmedDependents(beneficiaries).length > 0) {
      setInsuredOpen(true);
    }
  }, [showPreloadedDependents, beneficiaries]);

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
      dependents: getConfirmedDependents(beneficiaries),
    });
  }

  const confirmedDependents = getConfirmedDependents(beneficiaries);
  const insuredSummary = formatBeneficiariesBarSummary(beneficiaries);
  const insuredCount = 1 + confirmedDependents.length;

  return (
    <section
      className={joinClasses(
        criteriaBar,
        compactEmbed && "max-md:rounded-xl max-md:p-3 max-md:shadow-none",
      )}
    >
      <div
        className={joinClasses(
          "grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1.2fr_5rem_auto_auto_auto] lg:items-end lg:gap-4",
          compactEmbed && "max-md:grid-cols-2 max-md:gap-2",
        )}
      >
        <div className={joinClasses("space-y-1.5", compactEmbed && "max-md:space-y-1")}>
          <label
            htmlFor="qc-region"
            className={joinClasses(
              "text-xs font-semibold text-muted",
              compactEmbed && "max-md:text-[11px]",
            )}
          >
            Región
          </label>
          <select
            id="qc-region"
            value={criteria.region}
            onChange={(e) => onCriteriaChange({ region: e.target.value })}
            className={joinClasses(fieldClass, compactEmbed && compactFieldClass)}
          >
            <option value="">Selecciona...</option>
            {REGION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={joinClasses("space-y-1.5", compactEmbed && "max-md:space-y-1")}>
          <label
            htmlFor="qc-income"
            className={joinClasses(
              "text-xs font-semibold text-muted",
              compactEmbed && "max-md:text-[11px]",
            )}
          >
            Ingreso mensual líquido
          </label>
          <input
            id="qc-income"
            type="text"
            inputMode="numeric"
            placeholder={compactEmbed ? "$1.200.000" : "Ej: $1.200.000"}
            value={criteria.monthlyIncome}
            onChange={(e) =>
              onCriteriaChange({ monthlyIncome: e.target.value })
            }
            className={joinClasses(fieldClass, compactEmbed && compactFieldClass)}
          />
        </div>

        <div className={joinClasses("space-y-1.5", compactEmbed && "max-md:space-y-1")}>
          <label
            htmlFor="qc-age"
            className={joinClasses(
              "text-xs font-semibold text-muted",
              compactEmbed && "max-md:text-[11px]",
            )}
          >
            Edad
          </label>
          <input
            id="qc-age"
            type="number"
            min={18}
            max={120}
            value={ageInput}
            onChange={(e) => updateAge(e.target.value)}
            className={joinClasses(fieldClass, compactEmbed && compactFieldClass)}
          />
        </div>

        <div className={joinClasses("relative", compactEmbed && "max-md:col-span-2")} ref={popoverRef}>
          <button
            type="button"
            onClick={() => setInsuredOpen((v) => !v)}
            className={joinClasses(
              touchTarget,
              "h-11 w-full flex-col gap-0.5 rounded-xl border border-dashed border-primary/40 bg-white px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary/5 lg:w-auto lg:min-w-[12rem]",
              compactEmbed &&
                "max-md:h-auto max-md:min-h-9 max-md:rounded-lg max-md:px-3 max-md:py-1.5 max-md:text-xs",
            )}
          >
            <span className="inline-flex items-center gap-2">
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
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white max-md:text-[10px]">
                  {insuredCount}
                </span>
              ) : null}
            </span>
            {insuredSummary ? (
              <span className="max-w-full truncate text-[10px] font-medium text-muted max-md:text-[9px]">
                {insuredSummary}
              </span>
            ) : (
              <span className="text-[10px] font-normal text-muted max-md:text-[9px]">
                Sin cargas agregadas
              </span>
            )}
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
              <DependentLoadsEditor
                dependents={confirmedDependents}
                onDependentsChange={(dependents) =>
                  emit({ ...beneficiaries, dependents })
                }
                variant="popover"
              />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onCalculate}
          className={joinClasses(
            touchTarget,
            "h-11 rounded-full px-8 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition hover:brightness-105 sm:col-span-2 lg:col-span-1",
            compactEmbed &&
              "max-md:col-span-2 max-md:h-9 max-md:px-4 max-md:text-xs",
            ui.cta,
          )}
        >
          {compactEmbed ? (
            <>
              <span className="md:hidden">Buscar plan</span>
              <span className="hidden md:inline">Buscar mejor plan</span>
            </>
          ) : (
            "Buscar mejor plan"
          )}
        </button>

        {onResetAll ? (
          <button
            type="button"
            onClick={onResetAll}
            className={joinClasses(
              touchTarget,
              "h-11 rounded-full border px-5 text-sm font-semibold sm:col-span-2 lg:col-span-1",
              compactEmbed && "max-md:hidden",
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
