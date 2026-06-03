"use client";

import { motion } from "framer-motion";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { ChatIcon, ChevronDownIcon, DownloadIcon, ShieldIcon } from "./icons";

export interface PlanCardActionsProps {
  selected: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onChat?: () => void;
  onDownloadPdf?: () => void;
  onAddInsurance?: () => void;
}

function QuickActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={joinClasses(
        touchTarget,
        "rounded-full border border-secondary/25 bg-secondary-muted text-secondary transition hover:border-secondary/50 hover:shadow-sm active:scale-[0.98] md:size-10",
      )}
    >
      {children}
    </button>
  );
}

export function PlanCardActions({
  selected,
  expanded,
  onToggleExpand,
  onSelect,
  onChat,
  onDownloadPdf,
  onAddInsurance,
}: PlanCardActionsProps) {
  return (
    <footer
      className={joinClasses(
        "flex flex-col gap-4 border-t bg-white px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8",
        ui.border,
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className={joinClasses(
          touchTarget,
          "w-full justify-start gap-2 rounded-lg px-2 text-sm font-semibold text-secondary transition hover:bg-surface-hover md:w-auto",
        )}
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex shrink-0"
        >
          <ChevronDownIcon />
        </motion.span>
        <span className="text-left">
          {expanded ? "Ocultar desglose" : "Ver desglose por prestador"}
        </span>
      </button>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <QuickActionButton label="Chat del plan" onClick={onChat}>
            <ChatIcon />
          </QuickActionButton>
          <QuickActionButton label="Descargar PDF" onClick={onDownloadPdf}>
            <DownloadIcon />
          </QuickActionButton>
          <QuickActionButton label="Agregar seguros" onClick={onAddInsurance}>
            <ShieldIcon />
          </QuickActionButton>
        </div>

        <motion.button
          type="button"
          onClick={onSelect}
          whileTap={{ scale: 0.98 }}
          className={joinClasses(
            touchTarget,
            "w-full rounded-full px-6 text-sm font-bold tracking-tight shadow-md md:min-w-[11.5rem] md:w-auto",
            selected
              ? "border-2 border-primary bg-white text-primary-dark"
              : joinClasses(
                  ui.cta,
                  "shadow-[0_6px_20px_-6px_var(--primary)] hover:shadow-[0_8px_24px_-4px_var(--primary)]",
                ),
          )}
        >
          {selected ? "Plan seleccionado" : "Seleccionar plan"}
        </motion.button>
      </div>
    </footer>
  );
}
