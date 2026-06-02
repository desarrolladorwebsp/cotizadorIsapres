"use client";

import { motion } from "framer-motion";
import { ui } from "@/lib/ui-tokens";
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
      className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-brand-muted text-brand transition hover:border-[hsl(var(--brand)/0.4)] hover:bg-[hsl(var(--brand-muted))] active:scale-[0.98]"
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
        "flex flex-col gap-5 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8",
        ui.border,
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex text-brand"
        >
          <ChevronDownIcon />
        </motion.span>
        {expanded ? "Ocultar desglose" : "Ver desglose por prestador"}
      </button>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
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
            "inline-flex h-11 min-w-[11rem] items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight shadow-none",
            selected
              ? "border-2 border-action bg-background text-action"
              : joinClasses(ui.cta, "shadow-[0_4px_14px_-4px_hsl(var(--action)/0.45)]"),
          )}
        >
          {selected ? "Plan seleccionado" : "Seleccionar plan"}
        </motion.button>
      </div>
    </footer>
  );
}
