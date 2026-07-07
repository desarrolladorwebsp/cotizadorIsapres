"use client";

import { CoverageColumnCompact } from "./coverage-column-compact";
import {
  AmbulatoryCoverageIcon,
  HospitalCoverageIcon,
} from "./coverage-column-icons";
import type { PlanCardCoverageProps } from "./plan-card-coverage.types";

export type { PlanCardCoverageProps } from "./plan-card-coverage.types";

export function PlanCardCoverage({
  hospitalaria,
  ambulatoria,
  highlightClinicIds = [],
}: PlanCardCoverageProps) {
  return (
    <div className="grid border-t border-border md:grid-cols-2">
      <CoverageColumnCompact
        title="Cobertura hospitalaria"
        icon={<HospitalCoverageIcon />}
        entries={hospitalaria}
        barClassName="bg-primary"
        percentClassName="text-primary-dark"
        showDivider
        highlightClinicIds={highlightClinicIds}
      />
      <CoverageColumnCompact
        title="Cobertura ambulatoria"
        icon={<AmbulatoryCoverageIcon />}
        entries={ambulatoria}
        barClassName="bg-secondary"
        percentClassName="text-secondary"
        highlightClinicIds={highlightClinicIds}
      />
    </div>
  );
}
