"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PercentageTone } from "@/lib/ui-tokens";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { formatCoveragePercentagesList } from "@/domain";
import type { CoverageEntry } from "@/domain";
import { PercentagePill } from "./percentage-pill";
import { VISIBLE_CLINICS_LIMIT } from "./plan-card.utils";

export interface PlanCardCoverageProps {
  hospitalaria: CoverageEntry[];
  ambulatoria: CoverageEntry[];
}

interface CoverageColumnProps {
  title: string;
  entries: CoverageEntry[];
  tone: PercentageTone;
  showDivider?: boolean;
}

function ClinicRow({
  entry,
  tone,
}: {
  entry: CoverageEntry;
  tone: PercentageTone;
}) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-0 md:py-2.5">
      <span className="min-w-0 text-sm leading-snug text-foreground/80">
        {entry.clinic_name}
      </span>
      <PercentagePill value={entry.percentage} tone={tone} size="sm" />
    </li>
  );
}

function CoverageColumn({
  title,
  entries,
  tone,
  showDivider = false,
}: CoverageColumnProps) {
  const percentagesLabel = formatCoveragePercentagesList(entries);
  const visibleEntries = entries.slice(0, VISIBLE_CLINICS_LIMIT);
  const hiddenCount = Math.max(entries.length - VISIBLE_CLINICS_LIMIT, 0);

  return (
    <section
      className={joinClasses(
        "flex flex-col overflow-hidden bg-white",
        showDivider && "lg:border-r lg:border-border",
      )}
    >
      <div className="bg-primary-dark px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/95">
            {title}
          </h4>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-bold tabular-nums text-white">
            {percentagesLabel}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <ul>
          {visibleEntries.map((entry, index) => (
            <ClinicRow
              key={`${entry.type}-${entry.clinic_id}-${entry.percentage}-${index}`}
              entry={entry}
              tone={tone}
            />
          ))}
        </ul>

        {hiddenCount > 0 ? (
          <p className="mt-3 text-xs font-medium text-muted">
            +{hiddenCount} prestadores adicionales
          </p>
        ) : null}
      </div>
    </section>
  );
}

function CoverageAccordion({
  title,
  entries,
  tone,
  defaultOpen = false,
}: {
  title: string;
  entries: CoverageEntry[];
  tone: PercentageTone;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const percentagesLabel = formatCoveragePercentagesList(entries);
  const visibleEntries = entries.slice(0, VISIBLE_CLINICS_LIMIT);
  const hiddenCount = Math.max(entries.length - VISIBLE_CLINICS_LIMIT, 0);

  return (
    <section className="border-b border-border last:border-b-0 md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={joinClasses(
          "flex w-full items-center justify-between gap-3 bg-primary-dark px-4 text-left",
          touchTarget,
        )}
        aria-expanded={open}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-bold text-white">
            {percentagesLabel}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.22 }}
            className="text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
              <path
                d="M7 10l5 4 5-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.span>
        </div>
      </button>

      <div
        className={joinClasses(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="px-4 py-3">
            {visibleEntries.map((entry, index) => (
              <ClinicRow
                key={`mobile-${entry.type}-${entry.clinic_id}-${entry.percentage}-${index}`}
                entry={entry}
                tone={tone}
              />
            ))}
          </ul>
          {hiddenCount > 0 ? (
            <p className="px-4 pb-3 text-xs text-muted">
              +{hiddenCount} prestadores adicionales
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PlanCardCoverage({
  hospitalaria,
  ambulatoria,
}: PlanCardCoverageProps) {
  return (
    <div className={joinClasses(ui.border, "border-t")}>
      <div className="md:hidden">
        <CoverageAccordion
          title="Cobertura hospitalaria"
          entries={hospitalaria}
          tone="hospital"
        />
        <CoverageAccordion
          title="Cobertura ambulatoria"
          entries={ambulatoria}
          tone="ambulatory"
        />
      </div>

      <div className="hidden md:grid md:grid-cols-2">
        <CoverageColumn
          title="Cobertura hospitalaria"
          entries={hospitalaria}
          tone="hospital"
          showDivider
        />
        <CoverageColumn
          title="Cobertura ambulatoria"
          entries={ambulatoria}
          tone="ambulatory"
        />
      </div>
    </div>
  );
}
