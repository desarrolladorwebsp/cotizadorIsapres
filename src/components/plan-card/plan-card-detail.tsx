"use client";

import { motion } from "framer-motion";
import type { PercentageTone } from "@/lib/ui-tokens";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { CoverageEntry } from "@/types/plan";
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
  const barColor =
    tone === "hospital"
      ? "bg-[hsl(var(--coverage-hospital))]"
      : "bg-[hsl(var(--coverage-ambulatory))]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </h5>
      <ul className="space-y-3">
        {entries.map((entry, index) => (
          <motion.li
            key={`chart-${entry.type}-${entry.clinic_id}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02, duration: 0.25 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-xs text-foreground/75">
                {entry.clinic_name}
              </span>
              <PercentagePill value={entry.percentage} tone={tone} size="sm" />
            </div>
            <div className="h-px overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${entry.percentage}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={joinClasses("h-px rounded-full", barColor)}
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
        "grid gap-8 border-t bg-background px-6 py-6 sm:px-8 sm:py-7 lg:grid-cols-2",
        ui.border,
      )}
    >
      <CoverageBarChart
        title="Hospitalaria"
        entries={hospitalaria}
        tone="hospital"
      />
      <CoverageBarChart
        title="Ambulatoria"
        entries={ambulatoria}
        tone="ambulatory"
      />
    </div>
  );
}
