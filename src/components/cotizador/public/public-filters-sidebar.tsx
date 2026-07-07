"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardFiltersPanel } from "@/components/filters/dashboard-filters-panel";
import { usePlanClinicOptions } from "@/hooks/use-plan-clinic-options";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { formatPlanClp, formatPlanUf } from "@/domain";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { DashboardFiltersState } from "@/domain";

export interface PublicFiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  priceMin: number;
  priceMax: number;
  ufToClp: number;
  onPriceMinChange: (value: number) => void;
  onPriceMaxChange: (value: number) => void;
  filters: DashboardFiltersState;
  onFiltersChange: (next: DashboardFiltersState) => void;
  hideCoverageFilter?: boolean;
  hidePlanTypeFilter?: boolean;
  showClinicFilter?: boolean;
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

export function PublicFiltersSidebar({
  open,
  onClose,
  priceMin,
  priceMax,
  ufToClp,
  onPriceMinChange,
  onPriceMaxChange,
  filters,
  onFiltersChange,
  hideCoverageFilter = false,
  hidePlanTypeFilter = false,
  showClinicFilter = false,
}: PublicFiltersSidebarProps) {
  const isLargeScreen = useIsLargeScreen();
  const {
    options: clinicOptions,
    loading: clinicOptionsLoading,
    error: clinicOptionsError,
  } = usePlanClinicOptions(showClinicFilter);

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
            aria-label="Cerrar filtros"
            className="fixed inset-0 z-40 bg-primary-dark/20 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de búsqueda"
        initial={false}
        animate={{ x: isLargeScreen ? 0 : open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={joinClasses(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-full flex-col border-r bg-white shadow-xl",
          "lg:static lg:z-20 lg:w-72 lg:max-w-[18rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          ui.border,
          !open && "pointer-events-none lg:pointer-events-auto",
          open ? "lg:flex" : "lg:hidden",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={joinClasses(
              "flex shrink-0 items-center justify-between border-b px-4 py-4",
              ui.border,
            )}
          >
            <p className="text-sm font-bold text-primary-dark">Filtros</p>
            <button
              type="button"
              onClick={onClose}
              className={joinClasses("rounded-lg text-muted lg:hidden", touchTarget)}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto overscroll-y-contain p-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Precio</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary-dark">
                  {formatPlanClp(priceMin * ufToClp)} –{" "}
                  {formatPlanClp(priceMax * ufToClp)}
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                step={0.1}
                value={priceMin}
                onChange={(e) =>
                  onPriceMinChange(
                    Math.min(Number(e.target.value), priceMax),
                  )
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              />
              <input
                type="range"
                min={2}
                max={8}
                step={0.1}
                value={priceMax}
                onChange={(e) =>
                  onPriceMaxChange(
                    Math.max(Number(e.target.value), priceMin),
                  )
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              />
              <p className="text-[11px] text-muted">
                {formatPlanUf(priceMin)} – {formatPlanUf(priceMax)} UF
              </p>
            </section>

            <DashboardFiltersPanel
              value={filters}
              onChange={onFiltersChange}
              hideCoverageFilter={hideCoverageFilter}
              hidePlanTypeFilter={hidePlanTypeFilter}
              showClinicFilter={showClinicFilter}
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
