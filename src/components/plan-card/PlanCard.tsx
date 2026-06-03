"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GpuExpandPanel } from "@/components/ui/gpu-expand-panel";
import {
  coverageGlobalPercentage,
  splitCoverageByType,
} from "@/lib/plan-format";
import { buildPlanFinalPriceQuote } from "@/lib/plan-final-price";
import { motionGpu, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/types/beneficiary";
import type { HealthPlan } from "@/types/plan";
import { PlanCardActions } from "./plan-card-actions";
import { PlanCardCoverage } from "./plan-card-coverage";
import { PlanCardDetail } from "./plan-card-detail";
import { PlanCardHeader } from "./plan-card-header";

export interface PlanCardProps {
  plan: HealthPlan;
  beneficiarySummary: BeneficiaryGroupSummary;
  selected?: boolean;
  defaultExpanded?: boolean;
  ufToClp?: number;
  className?: string;
  onSelectedChange?: (selected: boolean) => void;
  onSelect?: () => void;
  onChat?: () => void;
  onDownloadPdf?: () => void;
  onAddInsurance?: () => void;
}

export function PlanCard({
  plan,
  beneficiarySummary,
  selected = false,
  defaultExpanded = false,
  ufToClp,
  className,
  onSelectedChange,
  onSelect,
  onChat,
  onDownloadPdf,
  onAddInsurance,
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isSelected, setIsSelected] = useState(selected);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  const { hospitalaria, ambulatoria } = useMemo(
    () => splitCoverageByType(plan.coverage),
    [plan.coverage],
  );

  const hospitalGlobal = useMemo(
    () => coverageGlobalPercentage(hospitalaria),
    [hospitalaria],
  );

  const ambulatoryGlobal = useMemo(
    () => coverageGlobalPercentage(ambulatoria),
    [ambulatoria],
  );

  const priceQuote = useMemo(
    () =>
      buildPlanFinalPriceQuote(
        plan.base_price_uf,
        beneficiarySummary,
        ufToClp,
      ),
    [plan.base_price_uf, beneficiarySummary, ufToClp],
  );

  function handleSelect() {
    const next = !isSelected;
    setIsSelected(next);
    onSelectedChange?.(next);
    onSelect?.();
  }

  return (
    <motion.article
      layout="position"
      initial={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ willChange: isHovered ? "transform, box-shadow" : "auto" }}
      animate={{
        y: isHovered ? -4 : 0,
        borderColor: isSelected || isHovered ? "var(--primary)" : "var(--border)",
        boxShadow:
          isHovered || isSelected
            ? "var(--shadow-card-hover)"
            : "var(--shadow-card)",
      }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={joinClasses(
        motionGpu,
        "overflow-hidden rounded-xl border-2 bg-white",
        isSelected && "ring-2 ring-primary/20",
        className,
      )}
    >
      <PlanCardHeader plan={plan} priceQuote={priceQuote} />

      <PlanCardCoverage
        hospitalaria={hospitalaria}
        ambulatoria={ambulatoria}
        hospitalGlobal={hospitalGlobal}
        ambulatoryGlobal={ambulatoryGlobal}
      />

      <GpuExpandPanel open={expanded}>
        <PlanCardDetail hospitalaria={hospitalaria} ambulatoria={ambulatoria} />
      </GpuExpandPanel>

      <PlanCardActions
        selected={isSelected}
        expanded={expanded}
        onToggleExpand={() => setExpanded((value) => !value)}
        onSelect={handleSelect}
        onChat={onChat}
        onDownloadPdf={onDownloadPdf}
        onAddInsurance={onAddInsurance}
      />
    </motion.article>
  );
}
