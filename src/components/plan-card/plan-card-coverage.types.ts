import type { CoverageEntry } from "@/domain";

export interface PlanCardCoverageProps {
  hospitalaria: CoverageEntry[];
  ambulatoria: CoverageEntry[];
  highlightClinicId?: string | null;
}
