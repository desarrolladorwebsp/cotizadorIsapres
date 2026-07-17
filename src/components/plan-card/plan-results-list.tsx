"use client";

import { motion } from "framer-motion";
import { motionGpu } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";
import { PlanCard, type PlanCardActiveClient } from "./PlanCard";

export interface PlanResultsListProps {
  plans: HealthPlan[];
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  onAssignPlan?: (plan: HealthPlan) => void;
  highlightHospitalClinicIds?: string[];
  highlightAmbulatoryClinicIds?: string[];
  activeClient?: PlanCardActiveClient | null;
  onNotify?: (message: string, tone?: "success" | "error") => void;
}

const ANIMATED_LIST_LIMIT = 24;

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 26,
    },
  },
};

export function PlanResultsList({
  plans,
  beneficiarySummary,
  ufToClp,
  onAssignPlan,
  highlightHospitalClinicIds = [],
  highlightAmbulatoryClinicIds = [],
  activeClient = null,
  onNotify,
}: PlanResultsListProps) {
  const shouldAnimate = plans.length <= ANIMATED_LIST_LIMIT;
  const listClassName = "flex flex-col gap-4 sm:gap-5 xl:gap-6";

  const sharedProps = {
    beneficiarySummary,
    ufToClp,
    highlightHospitalClinicIds,
    highlightAmbulatoryClinicIds,
    activeClient,
    onNotify,
    selectLabel: onAssignPlan ? "Asignar" : undefined,
    selectVariant: onAssignPlan ? ("success" as const) : undefined,
  };

  const cards = plans.map((plan) => (
    <PlanCard
      key={plan.unique_code}
      plan={plan}
      {...sharedProps}
      onSelect={onAssignPlan ? () => onAssignPlan(plan) : undefined}
    />
  ));

  if (!shouldAnimate) {
    return <div className={listClassName}>{cards}</div>;
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={listClassName}
    >
      {plans.map((plan) => (
        <motion.div
          key={plan.unique_code}
          variants={cardVariants}
          layout="position"
          className={joinClasses(motionGpu)}
          style={{ willChange: "transform, opacity" }}
        >
          <PlanCard
            plan={plan}
            {...sharedProps}
            onSelect={onAssignPlan ? () => onAssignPlan(plan) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
