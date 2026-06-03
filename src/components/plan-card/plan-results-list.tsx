"use client";

import { motion } from "framer-motion";
import { motionGpu } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/types/beneficiary";
import type { HealthPlan } from "@/types/plan";
import { PlanCard } from "./PlanCard";

export interface PlanResultsListProps {
  plans: HealthPlan[];
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
}

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
}: PlanResultsListProps) {
  return (
    <motion.div
      key={`${plans.map((p) => p.unique_code).join(",")}-${beneficiarySummary.totalFactors}-${beneficiarySummary.beneficiaryCount}`}
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 sm:gap-5 xl:gap-6"
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
            beneficiarySummary={beneficiarySummary}
            ufToClp={ufToClp}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
