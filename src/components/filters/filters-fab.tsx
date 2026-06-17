"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface FiltersFabProps {
  visible: boolean;
  onClick: () => void;
  activeFilterCount?: number;
}

export function FiltersFab({
  visible,
  onClick,
  activeFilterCount,
}: FiltersFabProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          onClick={onClick}
          aria-label="Abrir filtros y beneficiarios"
          className={joinClasses(
            "fixed bottom-5 left-5 z-40 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-5 shadow-[0_8px_28px_-6px_var(--primary)] lg:hidden",
            ui.cta,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5 shrink-0"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path
              d="M4 7h16M4 12h10M4 17h16"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm font-bold">Filtros</span>
          {activeFilterCount && activeFilterCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
