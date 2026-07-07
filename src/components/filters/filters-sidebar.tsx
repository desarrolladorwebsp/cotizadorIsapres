"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BeneficiariesForm } from "@/components/beneficiaries";
import { usePlanClinicOptions } from "@/hooks/use-plan-clinic-options";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/domain";
import type { DashboardFiltersState } from "@/domain";
import { DashboardFiltersPanel } from "./dashboard-filters-panel";

export interface FiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  beneficiaries: FamilyBeneficiariesState;
  onBeneficiariesChange: (
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) => void;
  filters: DashboardFiltersState;
  onFiltersChange: (next: DashboardFiltersState) => void;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FiltersSidebar({
  open,
  onClose,
  beneficiaries,
  onBeneficiariesChange,
  filters,
  onFiltersChange,
}: FiltersSidebarProps) {
  const isLargeScreen = useIsLargeScreen();
  const {
    options: clinicOptions,
    loading: clinicOptionsLoading,
    error: clinicOptionsError,
  } = usePlanClinicOptions(true);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="sidebar-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Cerrar panel de filtros"
            className="fixed inset-0 z-40 bg-primary-dark/20 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Panel de filtros"
        initial={false}
        animate={{
          x: isLargeScreen ? 0 : open ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={joinClasses(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-full flex-col border-r bg-white shadow-xl",
          "lg:static lg:z-20 lg:h-auto lg:max-h-none lg:w-80 lg:max-w-[20rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          ui.border,
          !open && "pointer-events-none lg:pointer-events-auto",
          open ? "lg:flex" : "lg:hidden",
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div
            className={joinClasses(
              "flex shrink-0 items-center justify-between border-b bg-white px-4 py-4 sm:px-6 lg:px-6",
              ui.border,
            )}
          >
            <p className={joinClasses("text-sm font-bold tracking-tight", ui.sectionTitle)}>
              Filtros y beneficiarios
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={joinClasses(
                  "inline-flex rounded-lg text-muted transition lg:hidden",
                  touchTarget,
                  ui.hoverSurface,
                )}
                aria-label="Cerrar filtros"
              >
                <CloseIcon />
              </button>
              <button
                type="button"
                onClick={onClose}
                className={joinClasses(
                  "hidden rounded-lg px-3 text-xs font-medium text-muted transition lg:inline-flex",
                  touchTarget,
                  ui.hoverSurface,
                )}
              >
                Ocultar
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain bg-bg-layout/40 p-4 sm:p-6 lg:p-6">
            <BeneficiariesForm
              value={beneficiaries}
              onChange={onBeneficiariesChange}
            />

            <DashboardFiltersPanel
              value={filters}
              onChange={onFiltersChange}
              showClinicFilter
              clinicOptions={clinicOptions}
              clinicOptionsLoading={clinicOptionsLoading}
              clinicOptionsError={clinicOptionsError}
            />
          </div>
        </div>
      </motion.aside>
    </>
  );
}
