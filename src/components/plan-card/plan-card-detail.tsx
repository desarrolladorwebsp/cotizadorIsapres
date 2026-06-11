"use client";

import { motion } from "framer-motion";
import { coverageBarGradient, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PercentageTone } from "@/lib/ui-tokens";
import type { CoverageEntry } from "@/domain";
import { PercentagePill } from "./percentage-pill";

export interface PlanCardDetailProps {
  hospitalaria: CoverageEntry[];
  ambulatoria: CoverageEntry[];
}

function CoverageBarChart({
  title,
  entries,
  tone,
}: {
  title: string;
  entries: CoverageEntry[];
  tone: PercentageTone;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl border border-border bg-white"
    >
      <div className="bg-primary-dark px-4 py-2.5">
        <h5 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          {title}
        </h5>
      </div>
      <ul className="space-y-3 p-4">
        {entries.map((entry, index) => (
          <motion.li
            key={`chart-${entry.type}-${entry.clinic_id}-${entry.percentage}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.025, duration: 0.28 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs font-medium text-foreground/80">
                {entry.clinic_name}
              </span>
              <PercentagePill value={entry.percentage} tone={tone} size="sm" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/80">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: entry.percentage / 100 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.02 }}
                className={joinClasses(
                  coverageBarGradient,
                  "origin-left transform-gpu will-change-transform",
                )}
                style={{ width: "100%" }}
              />
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function PlanCardDetail({
  hospitalaria,
  ambulatoria,
}: PlanCardDetailProps) {
  return (
    <div
      className={joinClasses(
        "grid gap-5 border-t bg-bg-layout/30 px-6 py-6 sm:px-8 sm:py-7 lg:grid-cols-2",
        ui.border,
      )}
    >
      <CoverageBarChart
        title="Desglose hospitalario"
        entries={hospitalaria}
        tone="hospital"
      />
      <CoverageBarChart
        title="Desglose ambulatorio"
        entries={ambulatoria}
        tone="ambulatory"
      />
    </div>
  );
}
