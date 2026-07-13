"use client";

import { useScrollLock } from "@/hooks/use-scroll-lock";
import { AnimatePresence, motion } from "framer-motion";
import { BeneficiariesForm } from "@/components/beneficiaries";
import { usePlanClinicOptions } from "@/hooks/use-plan-clinic-options";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { touchTarget, filtersSidebarDesktopShell, filtersSidebarScrollBody, ui } from "@/lib/ui-tokens";
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
  priceMin: number;
  priceMax: number;
  ufToClp: number;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  defaultPriceMin?: number;
  defaultPriceMax?: number;
  /** Oculta textos de ayuda en beneficiarios y filtros. */
  hideHelperText?: boolean;
  /** Estilo reforzado para el panel ejecutivo. */
  executiveVisual?: boolean;
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
  priceMin,
  priceMax,
  ufToClp,
  onPriceMinChange,
  onPriceMaxChange,
  defaultPriceMin,
  defaultPriceMax,
  hideHelperText = false,
  executiveVisual = false,
}: FiltersSidebarProps) {
  const isLargeScreen = useIsLargeScreen();
  const {
    options: clinicOptions,
    loading: clinicOptionsLoading,
    error: clinicOptionsError,
  } = usePlanClinicOptions(true);

  useScrollLock(open && !isLargeScreen);

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
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-full flex-col overflow-hidden border-r shadow-xl",
          "lg:w-80 lg:max-w-[20rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          filtersSidebarDesktopShell,
          executiveVisual
            ? "border-border/60 bg-white"
            : joinClasses("bg-white", ui.border),
          !open && "pointer-events-none lg:pointer-events-auto",
          open ? "lg:flex" : "lg:hidden",
        )}
        data-executive-filters={executiveVisual ? "true" : undefined}
      >
        <div className="flex h-full min-h-0 w-full flex-col lg:max-h-[inherit]">
          <div
            className={joinClasses(
              "flex shrink-0 items-center justify-between border-b px-4 py-3.5 sm:px-5 lg:px-5",
              executiveVisual
                ? "border-border/60 bg-white"
                : joinClasses("bg-white py-4", ui.border),
            )}
          >
            <div className="min-w-0">
              <p
                className={joinClasses(
                  "text-sm font-semibold tracking-tight text-primary-dark",
                )}
              >
                Filtros y beneficiarios
              </p>
            </div>
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

          <div
            className={joinClasses(
              filtersSidebarScrollBody,
              "px-4 sm:px-5",
              executiveVisual ? "py-0" : "py-2",
            )}
          >
            <div
              className={joinClasses(
                executiveVisual ? "divide-y divide-border/40" : "divide-y divide-border/50",
              )}
            >
              <BeneficiariesForm
                value={beneficiaries}
                onChange={onBeneficiariesChange}
                hideHelperText={hideHelperText}
                executiveVisual={executiveVisual}
                className={joinClasses(
                  executiveVisual
                    ? "!rounded-none !border-0 !bg-transparent !p-0 !py-4 !shadow-none"
                    : "!rounded-none !border-0 !bg-transparent !p-0 !py-4 !shadow-none sm:!py-5",
                )}
              />

              <div className={executiveVisual ? undefined : "py-2"}>
                <DashboardFiltersPanel
                  value={filters}
                  onChange={onFiltersChange}
                  showClinicFilter
                  clinicOptions={clinicOptions}
                  clinicOptionsLoading={clinicOptionsLoading}
                  clinicOptionsError={clinicOptionsError}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  ufToClp={ufToClp}
                  onPriceMinChange={onPriceMinChange}
                  onPriceMaxChange={onPriceMaxChange}
                  defaultPriceMin={defaultPriceMin}
                  defaultPriceMax={defaultPriceMax}
                  hideHelperText={hideHelperText}
                  executiveVisual={executiveVisual}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
