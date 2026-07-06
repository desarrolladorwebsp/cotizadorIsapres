"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { splitCoverageByType } from "@/domain";
import { buildPlanFinalPriceQuote } from "@/domain";
import { getPlanPdfDownloadUrl, planHasPdf } from "@/lib/plan-pdf";
import { planCard, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";
import { PlanCardActions } from "./plan-card-actions";
import { PlanCardCoverage } from "./plan-card-coverage";
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
  selectLabel?: string;
  selectVariant?: "primary" | "success";
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
  selectLabel,
  selectVariant,
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded); // reservado para acciones futuras
  const [isSelected, setIsSelected] = useState(selected);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsSelected(selected);
  }, [selected]);

  const { hospitalaria, ambulatoria } = useMemo(
    () => splitCoverageByType(plan.coverage),
    [plan.coverage],
  );

  const priceQuote = useMemo(
    () =>
      buildPlanFinalPriceQuote(
        plan.base_price_uf,
        beneficiarySummary,
        ufToClp,
        plan.ges_premium_uf,
      ),
    [plan.base_price_uf, plan.ges_premium_uf, beneficiarySummary, ufToClp],
  );

  function handleSelect() {
    if (onSelect && !onSelectedChange) {
      onSelect();
      return;
    }

    const next = !isSelected;
    setIsSelected(next);
    onSelectedChange?.(next);
    onSelect?.();
  }

  function handleDownloadPdf() {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }

    if (!planHasPdf(plan)) {
      window.alert(
        "El PDF de este plan estará disponible pronto. Aún no se ha cargado desde administración.",
      );
      return;
    }

    const url = getPlanPdfDownloadUrl(plan);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.article
      layout="position"
      initial={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ willChange: isHovered ? "transform, box-shadow" : "auto" }}
      animate={{
        y: isHovered ? -planCard.elevation.hoverLiftPx : 0,
        borderColor:
          isSelected || isHovered
            ? planCard.elevation.borderHover
            : planCard.elevation.borderRest,
        boxShadow:
          isHovered || isSelected
            ? planCard.elevation.shadowHover
            : planCard.elevation.shadowRest,
      }}
      transition={planCard.elevation.spring}
      className={joinClasses(
        planCard.root,
        isSelected && "ring-2 ring-primary/20",
        className,
      )}
    >
      <PlanCardHeader plan={plan} priceQuote={priceQuote} />

      <PlanCardCoverage
        hospitalaria={hospitalaria}
        ambulatoria={ambulatoria}
        showAllClinics={expanded}
      />

      <PlanCardActions
        selected={isSelected}
        expanded={expanded}
        onToggleExpand={() => setExpanded((value) => !value)}
        onSelect={handleSelect}
        onChat={onChat}
        onDownloadPdf={handleDownloadPdf}
        onAddInsurance={onAddInsurance}
        selectLabel={selectLabel}
        selectVariant={selectVariant}
      />
    </motion.article>
  );
}
