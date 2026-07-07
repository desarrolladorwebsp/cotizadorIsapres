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
  /** Vista compacta para widget embebido en móvil. */
  compactEmbed?: boolean;
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
  compactEmbed = false,
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
        aria-modal={open ? "true" : undefined}
        aria-hidden={open ? undefined : true}
        aria-label="Filtros de búsqueda"
        initial={false}
        animate={{ x: isLargeScreen ? 0 : open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={joinClasses(
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-full flex-col border-r bg-white shadow-xl",
          compactEmbed
            ? "max-md:max-w-[17rem] lg:static lg:z-20 lg:w-60 lg:max-w-[15rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none"
            : "lg:static lg:z-20 lg:w-72 lg:max-w-[18rem] lg:shrink-0 lg:translate-x-0 lg:shadow-none",
          ui.border,
          !open && "pointer-events-none lg:pointer-events-auto",
          open ? "lg:flex" : "lg:hidden",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={joinClasses(
              "flex shrink-0 items-center justify-between border-b px-4 py-4",
              compactEmbed && "max-md:px-3 max-md:py-2.5",
              ui.border,
            )}
          >
            <p
              className={joinClasses(
                "text-sm font-bold text-primary-dark",
                compactEmbed && "max-md:text-xs",
              )}
            >
              Filtros
            </p>
            <button
              type="button"
              onClick={onClose}
              className={joinClasses("rounded-lg text-muted lg:hidden", touchTarget)}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <div
            className={joinClasses(
              "flex-1 space-y-6 overflow-y-auto overscroll-y-contain p-4",
              compactEmbed && "max-md:space-y-3 max-md:p-3",
            )}
          >
            <section className={joinClasses("space-y-3", compactEmbed && "max-md:space-y-2")}>
              <div className="flex items-center justify-between gap-2">
                <h3
                  className={joinClasses(
                    "text-sm font-bold text-foreground",
                    compactEmbed && "max-md:text-xs",
                  )}
                >
                  Precio
                </h3>
                <span
                  className={joinClasses(
                    "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold tabular-nums text-primary-dark",
                    compactEmbed && "max-md:px-2 max-md:py-0.5 max-md:text-[10px]",
                  )}
                >
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
              <p
                className={joinClasses(
                  "text-[11px] text-muted",
                  compactEmbed && "max-md:text-[10px]",
                )}
              >
                {formatPlanUf(priceMin)} – {formatPlanUf(priceMax)} UF
              </p>
            </section>

            <DashboardFiltersPanel
              value={filters}
              onChange={onFiltersChange}
              hideCoverageFilter={hideCoverageFilter}
              hidePlanTypeFilter={hidePlanTypeFilter}
              showClinicFilter={showClinicFilter}
              compactEmbed={compactEmbed}
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
