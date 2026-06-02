import type { PercentageTone } from "@/lib/ui-tokens";
import type { CoverageEntry } from "@/types/plan";
import { PercentagePill } from "./percentage-pill";
import { VISIBLE_CLINICS_LIMIT } from "./plan-card.utils";

export interface PlanCardCoverageProps {
  hospitalaria: CoverageEntry[];
  ambulatoria: CoverageEntry[];
  hospitalGlobal: number;
  ambulatoryGlobal: number;
}

interface CoverageColumnProps {
  title: string;
  entries: CoverageEntry[];
  globalPercentage: number;
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
    <li className="flex items-center justify-between gap-4">
      <span className="min-w-0 text-sm leading-snug text-foreground/75">
        {entry.clinic_name}
      </span>
      <PercentagePill value={entry.percentage} tone={tone} size="sm" />
    </li>
  );
}

function CoverageColumn({
  title,
  entries,
  globalPercentage,
  tone,
  showDivider = false,
}: CoverageColumnProps) {
  const visibleEntries = entries.slice(0, VISIBLE_CLINICS_LIMIT);
  const hiddenCount = Math.max(entries.length - VISIBLE_CLINICS_LIMIT, 0);

  return (
    <section className={showDivider ? "border-border md:border-r" : undefined}>
      <div className="flex flex-col bg-background px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h4 className="max-w-[12rem] text-[10px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-muted">
            {title}
          </h4>
          <PercentagePill
            value={globalPercentage}
            tone={tone}
            size="lg"
          />
        </div>

        <ul className="space-y-3.5">
          {visibleEntries.map((entry) => (
            <ClinicRow
              key={`${entry.type}-${entry.clinic_id}`}
              entry={entry}
              tone={tone}
            />
          ))}
        </ul>

        {hiddenCount > 0 ? (
          <p className="mt-4 text-xs text-muted/80">
            +{hiddenCount} prestadores adicionales
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function PlanCardCoverage({
  hospitalaria,
  ambulatoria,
  hospitalGlobal,
  ambulatoryGlobal,
}: PlanCardCoverageProps) {
  return (
    <div className="grid bg-background md:grid-cols-2">
      <CoverageColumn
        title="Cobertura hospitalaria"
        entries={hospitalaria}
        globalPercentage={hospitalGlobal}
        tone="hospital"
        showDivider
      />
      <CoverageColumn
        title="Cobertura ambulatoria"
        entries={ambulatoria}
        globalPercentage={ambulatoryGlobal}
        tone="ambulatory"
      />
    </div>
  );
}
