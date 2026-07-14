"use client";

import { motion } from "framer-motion";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import { ChatIcon, DownloadIcon, ShieldIcon } from "./icons";

export interface PlanCardActionsProps {
  selected: boolean;
  onSelect: () => void;
  onChat?: () => void;
  onDownloadPdf?: () => void;
  onAddInsurance?: () => void;
  selectLabel?: string;
  selectVariant?: "primary" | "success";
}

type QuickActionTone = "chat" | "download" | "shield";

const quickActionToneClass: Record<QuickActionTone, string> = {
  chat: "border-primary/45 bg-primary/15 text-primary hover:border-primary hover:bg-primary/25 hover:shadow-[0_4px_12px_-4px_rgb(26,111,217/0.45)]",
  download:
    "border-secondary/50 bg-secondary-muted text-secondary hover:border-secondary hover:bg-secondary/20 hover:shadow-[0_4px_12px_-4px_rgb(13,158,196/0.45)]",
  shield:
    "border-emerald-500/45 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-100 hover:shadow-[0_4px_12px_-4px_rgb(16,185,129/0.45)]",
};

function QuickActionButton({
  label,
  onClick,
  tone,
  children,
}: {
  label: string;
  onClick?: () => void;
  tone: QuickActionTone;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      data-executive-quick-action={tone}
      className={joinClasses(
        touchTarget,
        "rounded-full border transition active:scale-[0.98] md:size-10",
        quickActionToneClass[tone],
      )}
    >
      {children}
    </button>
  );
}

export function PlanCardActions({
  selected,
  onSelect,
  onChat,
  onDownloadPdf,
  onAddInsurance,
  selectLabel,
  selectVariant = "primary",
}: PlanCardActionsProps) {
  return (
    <footer
      className={joinClasses(
        "flex flex-col gap-4 border-t bg-white px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-end lg:px-8",
        ui.border,
      )}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto md:justify-end">
        <div className="flex items-center justify-center gap-2.5 sm:justify-start">
          <QuickActionButton label="Chat del plan" onClick={onChat} tone="chat">
            <ChatIcon />
          </QuickActionButton>
          <QuickActionButton
            label="Descargar PDF"
            onClick={onDownloadPdf}
            tone="download"
          >
            <DownloadIcon />
          </QuickActionButton>
          <QuickActionButton
            label="Agregar seguros"
            onClick={onAddInsurance}
            tone="shield"
          >
            <ShieldIcon />
          </QuickActionButton>
        </div>

        <motion.button
          type="button"
          onClick={onSelect}
          whileTap={{ scale: 0.98 }}
          data-executive-assign-cta={selectVariant === "success" ? "true" : undefined}
          data-selected={selected ? "true" : undefined}
          className={joinClasses(
            touchTarget,
            "w-full rounded-full px-6 text-sm font-bold tracking-tight shadow-md md:min-w-[11.5rem] md:w-auto",
            selected
              ? selectVariant === "success"
                ? "border-2 border-emerald-600 bg-white text-emerald-900"
                : "border-2 border-primary bg-white text-primary-dark"
              : selectVariant === "success"
                ? "border border-emerald-300 bg-emerald-600 text-white shadow-[0_8px_24px_-6px_rgb(5,150,105)] hover:bg-emerald-700"
                : joinClasses(
                    ui.cta,
                    "shadow-[0_6px_20px_-6px_var(--primary)] hover:shadow-[0_8px_24px_-4px_var(--primary)]",
                  ),
          )}
        >
          {selected
            ? "Plan seleccionado"
            : (selectLabel ?? "Seleccionar plan")}
        </motion.button>
      </div>
    </footer>
  );
}
