import { calculateFinalPlanPriceClp } from "@/lib/plan-final-price";
import type { PlanFinalPriceQuote } from "@/lib/plan-final-price";
import { resolveIsapreIdFromName } from "@/lib/isapre-catalog";
import type { ValidatedCompanyAgreement } from "@/types/company-agreement";

export interface PlanAgreementPriceDisplay {
  /** Precio de lista (sin descuento de convenio). */
  listFinalPriceUf: number;
  listFinalPriceClp: number;
  /** Precio a mostrar (con descuento referencial si aplica). */
  displayFinalPriceUf: number;
  displayFinalPriceClp: number;
  hasAgreementDiscount: boolean;
  discountPercent: number;
}

/**
 * Determina si el plan pertenece a la isapre del convenio validado.
 */
export function doesPlanMatchCompanyAgreement(
  planIsapre: string,
  agreement:
    | Pick<ValidatedCompanyAgreement, "isapreId" | "isapreName">
    | null
    | undefined,
): boolean {
  if (!agreement) return false;

  const planName = planIsapre.trim();
  if (!planName) return false;

  const planIsapreId = resolveIsapreIdFromName(planName);
  if (agreement.isapreId && planIsapreId === agreement.isapreId) {
    return true;
  }

  const agreementName = agreement.isapreName?.trim();
  if (
    agreementName &&
    planName.localeCompare(agreementName, "es", { sensitivity: "accent" }) === 0
  ) {
    return true;
  }

  return false;
}

export function resolveAgreementDiscountPercentForPlan(
  planIsapre: string,
  agreement:
    | Pick<
        ValidatedCompanyAgreement,
        "discountPercent" | "isapreId" | "isapreName"
      >
    | null
    | undefined,
): number | null {
  if (!agreement) return null;
  if (!doesPlanMatchCompanyAgreement(planIsapre, agreement)) return null;

  const percent = agreement.discountPercent;
  if (percent == null || !Number.isFinite(percent) || percent <= 0) {
    return null;
  }

  return Math.min(100, percent);
}

/**
 * Aplica el descuento referencial del convenio sobre el precio final
 * mostrado del plan (UF/CLP). Es referencial: no altera el cálculo base
 * ni el valor persistido sin descuento.
 */
export function buildPlanAgreementPriceDisplay(
  quote: PlanFinalPriceQuote,
  discountPercent: number | null | undefined,
): PlanAgreementPriceDisplay {
  const listFinalPriceUf = quote.finalPriceUf;
  const listFinalPriceClp = quote.finalPriceClp;

  if (
    discountPercent == null ||
    !Number.isFinite(discountPercent) ||
    discountPercent <= 0
  ) {
    return {
      listFinalPriceUf,
      listFinalPriceClp,
      displayFinalPriceUf: listFinalPriceUf,
      displayFinalPriceClp: listFinalPriceClp,
      hasAgreementDiscount: false,
      discountPercent: 0,
    };
  }

  const factor = Math.max(0, 1 - discountPercent / 100);
  const displayFinalPriceUf =
    Math.round(quote.finalPriceUf * factor * 1_000_000) / 1_000_000;
  const displayFinalPriceClp = calculateFinalPlanPriceClp(
    displayFinalPriceUf,
    quote.ufToClp,
  );

  return {
    listFinalPriceUf,
    listFinalPriceClp,
    displayFinalPriceUf,
    displayFinalPriceClp,
    hasAgreementDiscount: true,
    discountPercent,
  };
}
