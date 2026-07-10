"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildBeneficiaryGroupSummary, parseBeneficiaryAge } from "@/domain";
import { DependentLoadsEditor } from "@/components/beneficiaries/dependent-loads-editor";
import { formatMonthlyIncomeForDisplay } from "@/lib/deep-link/income";
import { getMissingQuoteCriteriaFields } from "@/lib/quote-criteria-validation";
import {
  CONTRIBUTOR_TYPE_OPTIONS,
  type QuoteCriteria,
} from "@/lib/quote-criteria-options";
import {
  getConfirmedDependents,
} from "@/lib/beneficiary-display";
import { criteriaBar, safeWidth, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { CompanyAgreementValidationSection } from "@/components/cotizador/company-agreement";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/domain";

export type { QuoteCriteria } from "@/lib/quote-criteria-options";
export { createDefaultQuoteCriteria } from "@/lib/quote-criteria-options";

export type CompanyAgreementVariant = "standalone" | "inline";

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
  /** Muestra consulta de convenio empresa integrada en la tarjeta. */
  showCompanyAgreement?: boolean;
  partnerEntitySlug?: string;
}

const fieldClass = joinClasses(
  "h-11 w-full rounded-xl border-0 bg-white px-3 text-sm shadow-sm ring-1 ring-border/80 focus:ring-2 focus:ring-primary/40",
);

const compactFieldClass =
  "max-md:h-9 max-md:rounded-lg max-md:px-2.5 max-md:text-xs";

const labelClass = "text-xs font-semibold text-muted";

export function PublicQuoteCriteriaBar({
  criteria,
  onCriteriaChange,
  beneficiaries,
  onBeneficiariesChange,
  onCalculate,
  onResetAll,
  compactEmbed = false,
  showPreloadedDependents = false,
  showCompanyAgreement = true,
  partnerEntitySlug,
}: PublicQuoteCriteriaBarProps) {
  const [ageInput, setAgeInput] = useState(
    beneficiaries.contributorAge !== null
      ? String(beneficiaries.contributorAge)
      : "",
  );
  const [loadsOpen, setLoadsOpen] = useState(showPreloadedDependents);
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
      setLoadsOpen(true);
    }
  }, [showPreloadedDependents, beneficiaries]);

  useEffect(() => {
    if (!loadsOpen) return;
    function handleClick(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setLoadsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [loadsOpen]);

  const emitBeneficiaries = useCallback(
    (next: FamilyBeneficiariesState) => {
      onBeneficiariesChange(next, buildBeneficiaryGroupSummary(next));
    },
    [onBeneficiariesChange],
  );

  function updateAge(raw: string) {
    setAgeInput(raw);
    emitBeneficiaries({
      ...beneficiaries,
      contributorAge: parseBeneficiaryAge(raw),
      dependents: getConfirmedDependents(beneficiaries),
    });
  }

  function updateContributorType(value: QuoteCriteria["contributorType"]) {
    onCriteriaChange({ contributorType: value });
  }

  function updateIncome(raw: string) {
    onCriteriaChange({ monthlyIncome: raw });
  }

  function commitIncomeFormat() {
    const formatted = formatMonthlyIncomeForDisplay(criteria.monthlyIncome);
    if (formatted !== criteria.monthlyIncome) {
      onCriteriaChange({ monthlyIncome: formatted });
    }
  }

  function emitDependents(nextDependents: FamilyBeneficiariesState["dependents"]) {
    emitBeneficiaries({
      ...beneficiaries,
      dependents: nextDependents,
    });
  }

  const confirmedDependents = getConfirmedDependents(beneficiaries);
  const loadsCount = confirmedDependents.length;

  function handleSearchClick() {
    commitIncomeFormat();

    const missing = getMissingQuoteCriteriaFields({
      criteria,
      beneficiaries,
    });

    if (missing.length > 0) {
      if (missing.includes("edad")) {
        document.getElementById("qc-age")?.focus();
      } else if (missing.includes("tipo de cotizante")) {
        document.getElementById("qc-contributor-type")?.focus();
      } else if (missing.includes("renta imponible")) {
        document.getElementById("qc-income")?.focus();
      }
      return;
    }

    onCalculate();
  }

  return (
    <section
      className={joinClasses(
        criteriaBar,
        compactEmbed && "max-md:rounded-xl max-md:p-3 max-md:shadow-none",
      )}
    >
      <div
        className={joinClasses(
          "flex w-full flex-col gap-3",
          "lg:grid lg:items-end lg:gap-4",
          "lg:grid-cols-[minmax(4.5rem,0.55fr)_minmax(9.5rem,1fr)_minmax(10rem,1.35fr)_minmax(10rem,1.2fr)_minmax(10.5rem,1.05fr)_minmax(9rem,0.95fr)]",
          "xl:gap-5",
          compactEmbed && "max-md:gap-y-2.5 sm:grid sm:grid-cols-2 sm:items-end",
        )}
      >
        {/* Edad */}
        <div
          className={joinClasses(
            safeWidth,
            "min-w-0 space-y-1.5",
            compactEmbed && "max-md:col-span-2 max-md:space-y-1",
          )}
        >
          <label
            htmlFor="qc-age"
            className={joinClasses(labelClass, compactEmbed && "max-md:text-[11px]")}
          >
            Edad
          </label>
          <input
            id="qc-age"
            type="number"
            min={18}
            max={120}
            inputMode="numeric"
            placeholder="35"
            value={ageInput}
            onChange={(event) => updateAge(event.target.value)}
            className={joinClasses(
              fieldClass,
              compactEmbed && compactFieldClass,
              "text-center tabular-nums lg:px-2",
            )}
          />
        </div>

        {/* Tipo de cotizante */}
        <div
          className={joinClasses(
            safeWidth,
            "min-w-0 space-y-1.5",
            compactEmbed && "max-md:space-y-1",
          )}
        >
          <label
            htmlFor="qc-contributor-type"
            className={joinClasses(labelClass, compactEmbed && "max-md:text-[11px]")}
          >
            Tipo de cotizante
          </label>
          <select
            id="qc-contributor-type"
            value={criteria.contributorType}
            onChange={(event) =>
              updateContributorType(
                event.target.value as QuoteCriteria["contributorType"],
              )
            }
            className={joinClasses(fieldClass, compactEmbed && compactFieldClass)}
          >
            <option value="">Selecciona...</option>
            {CONTRIBUTOR_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Renta imponible */}
        <div
          className={joinClasses(
            safeWidth,
            "min-w-0 space-y-1.5",
            compactEmbed && "max-md:space-y-1",
          )}
        >
          <label
            htmlFor="qc-income"
            className={joinClasses(labelClass, compactEmbed && "max-md:text-[11px]")}
          >
            Renta imponible
          </label>
          <input
            id="qc-income"
            type="text"
            inputMode="numeric"
            placeholder="Ej: $1.200.000"
            value={criteria.monthlyIncome}
            onChange={(event) => updateIncome(event.target.value)}
            onBlur={commitIncomeFormat}
            className={joinClasses(fieldClass, compactEmbed && compactFieldClass)}
          />
        </div>

        {/* Cargas médicas */}
        <div
          ref={popoverRef}
          className={joinClasses(
            safeWidth,
            "relative min-w-0 space-y-1.5",
            compactEmbed && "max-md:space-y-1",
          )}
        >
          <p
            className={joinClasses(labelClass, compactEmbed && "max-md:text-[11px]")}
          >
            Cargas médicas
          </p>
          <button
            type="button"
            onClick={() => setLoadsOpen((open) => !open)}
            className={joinClasses(
              touchTarget,
              "flex h-11 w-full items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-white px-3 text-sm font-semibold text-primary-dark transition hover:bg-primary/5",
              compactEmbed && "max-md:min-h-10 max-md:rounded-lg max-md:px-2.5 max-md:text-xs",
            )}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={joinClasses(
                  "size-4 shrink-0",
                  compactEmbed && "max-md:size-3.5",
                )}
                aria-hidden
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="truncate">Gestionar cargas</span>
              {loadsCount > 0 ? (
                <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">
                  {loadsCount}
                </span>
              ) : null}
            </span>
          </button>

          {loadsOpen ? (
            <div
              className={joinClasses(
                "absolute right-0 top-full z-20 mt-2 rounded-2xl border bg-white p-4 shadow-xl",
                compactEmbed
                  ? "left-0 w-full max-md:p-3"
                  : "w-[min(100vw-2rem,20rem)]",
                ui.border,
              )}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                Cargas médicas
              </p>
              <DependentLoadsEditor
                dependents={confirmedDependents}
                onDependentsChange={(dependents) => emitDependents(dependents)}
                variant="popover"
              />
            </div>
          ) : null}
        </div>

        {/* Buscar mejor plan */}
        <button
          type="button"
          onClick={handleSearchClick}
          className={joinClasses(
            touchTarget,
            "h-11 w-full shrink-0 rounded-full px-5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition hover:brightness-105",
            compactEmbed && "max-md:h-10 max-md:px-4 max-md:text-xs sm:col-span-2",
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

        {/* Limpiar todo */}
        {onResetAll ? (
          <button
            type="button"
            onClick={onResetAll}
            className={joinClasses(
              touchTarget,
              "h-11 w-full shrink-0 rounded-full border px-4 text-sm font-semibold",
              compactEmbed && "max-md:h-10 max-md:px-4 max-md:text-xs sm:col-span-2",
              ui.border,
              "bg-white text-muted transition hover:border-primary/35 hover:bg-surface-hover hover:text-primary-dark",
            )}
          >
            {compactEmbed ? (
              <>
                <span className="md:hidden">Limpiar</span>
                <span className="hidden md:inline">Limpiar todo</span>
              </>
            ) : (
              "Limpiar todo"
            )}
          </button>
        ) : null}
      </div>

      {showCompanyAgreement ? (
        <CompanyAgreementValidationSection
          variant="inline"
          compactEmbed={compactEmbed}
          source="public"
          partnerEntitySlug={partnerEntitySlug}
        />
      ) : null}
    </section>
  );
}
