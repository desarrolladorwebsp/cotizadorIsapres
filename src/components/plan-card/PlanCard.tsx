"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  coverageGlobalPercentage,
  splitCoverageByType,
} from "@/lib/plan-format";
import { joinClasses } from "@/lib/utils";
import type { HealthPlan } from "@/types/plan";
import { PlanCardActions } from "./plan-card-actions";
import { PlanCardCoverage } from "./plan-card-coverage";
import { PlanCardDetail } from "./plan-card-detail";
import { PlanCardHeader } from "./plan-card-header";
import { resolvePlanBadges } from "./plan-card.utils";

export interface PlanCardProps {
  plan: HealthPlan;
  selected?: boolean;
  defaultExpanded?: boolean;
  badges?: string[];
  ufToClp?: number;
  className?: string;
  onSelectedChange?: (selected: boolean) => void;
  onSelect?: () => void;
  onChat?: () => void;
  onDownloadPdf?: () => void;
  onAddInsurance?: () => void;
}

const cardTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

export function PlanCard({
  plan,
  selected = false,
  defaultExpanded = false,
  badges,
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

  const resolvedBadges = useMemo(
    () => resolvePlanBadges(plan, badges),
    [plan, badges],
  );

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

  function handleSelect() {
    const next = !isSelected;
    setIsSelected(next);
    onSelectedChange?.(next);
    onSelect?.();
  }

  const borderColor = isSelected
    ? "hsl(var(--action) / 0.55)"
    : isHovered
      ? "hsl(var(--brand) / 0.28)"
      : "hsl(var(--border))";

  return (
    <motion.article
      layout
      initial={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        y: isHovered ? -2 : 0,
        borderColor,
        boxShadow: isHovered
          ? "var(--shadow-card-hover, 0 16px 48px -24px hsl(222 47% 11% / 0.1))"
          : "none",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={joinClasses(
        "overflow-hidden rounded-xl border bg-background",
        className,
      )}
      style={
        {
          "--shadow-card-hover":
            "0 16px 48px -24px hsl(var(--foreground) / 0.1)",
        } as React.CSSProperties
      }
    >
      <PlanCardHeader
        plan={plan}
        badges={resolvedBadges}
        ufToClp={ufToClp}
      />

      <PlanCardCoverage
        hospitalaria={hospitalaria}
        ambulatoria={ambulatoria}
        hospitalGlobal={hospitalGlobal}
        ambulatoryGlobal={ambulatoryGlobal}
      />

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="plan-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={cardTransition}
            className="overflow-hidden"
          >
            <PlanCardDetail
              hospitalaria={hospitalaria}
              ambulatoria={ambulatoria}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

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
