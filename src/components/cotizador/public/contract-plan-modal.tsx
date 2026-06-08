"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  buildPlanFinalPriceQuote,
  formatPlanClp,
  formatQuotedUf,
  resolveCommercialPlanName,
} from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { BeneficiaryGroupSummary } from "@/domain";
import type { HealthPlan } from "@/domain";

export interface ContractPlanModalProps {
  open: boolean;
  plan: HealthPlan | null;
  beneficiarySummary: BeneficiaryGroupSummary;
  ufToClp: number;
  onClose: () => void;
}

export function ContractPlanModal({
  open,
  plan,
  beneficiarySummary,
  ufToClp,
  onClose,
}: ContractPlanModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!plan) return null;

  const priceQuote = buildPlanFinalPriceQuote(
    plan.base_price_uf,
    beneficiarySummary,
    ufToClp,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={joinClasses(
              "relative z-10 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-2xl",
              ui.border,
            )}
          >
            <div className="bg-gradient-to-r from-primary-dark to-primary px-5 py-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/75">
                Solicitar plan
              </p>
              <h2 className="mt-1 text-lg font-bold">
                {resolveCommercialPlanName(plan)}
              </h2>
              <p className="mt-1 text-sm text-white/90">
                {formatQuotedUf(priceQuote.finalPriceUf)} ·{" "}
                {formatPlanClp(priceQuote.finalPriceClp)} / mes
              </p>
            </div>

            {submitted ? (
              <div className="space-y-4 px-5 py-8 text-center">
                <p className="text-lg font-bold text-primary-dark">
                  ¡Solicitud recibida!
                </p>
                <p className="text-sm text-muted">
                  Un ejecutivo de Isapres Premium te contactará para finalizar tu
                  incorporación a {plan.isapre}.
                </p>
                <Button type="button" onClick={onClose} className="w-full">
                  Cerrar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
                <input
                  required
                  placeholder="Nombre y apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
                />
                <input
                  required
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
                />
                <input
                  required
                  type="tel"
                  placeholder="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={joinClasses("h-11 w-full rounded-xl px-3 text-sm", ui.input)}
                />
                <div className="flex gap-3 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className={touchTarget}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className={joinClasses(touchTarget, "flex-1")}>
                    Enviar solicitud
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
