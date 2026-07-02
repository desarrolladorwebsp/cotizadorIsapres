"use client";

import { motion } from "framer-motion";
import { PLAN_LOADING_SKELETON_COUNT } from "@/lib/plan-search-config";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

const skeletonPulse = "animate-pulse rounded-lg bg-foreground/8";

function PlanCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className={joinClasses(
        "motion-safe-fade-in overflow-hidden rounded-xl border bg-white",
        ui.border,
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        className={joinClasses(
          "flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4",
          ui.border,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className={joinClasses(skeletonPulse, "size-10 shrink-0 rounded-lg")} />
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className={joinClasses(skeletonPulse, "h-4 w-3/4 max-w-[14rem]")} />
            <div className="flex flex-wrap gap-2">
              <div className={joinClasses(skeletonPulse, "h-6 w-20")} />
              <div className={joinClasses(skeletonPulse, "h-6 w-16")} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className={joinClasses(skeletonPulse, "h-10 w-16")} />
          <div className={joinClasses(skeletonPulse, "h-10 w-20")} />
        </div>
      </div>

      <div className="grid gap-3 px-3 py-3 sm:grid-cols-2 sm:px-4">
        <div className={joinClasses(skeletonPulse, "h-12 w-full")} />
        <div className={joinClasses(skeletonPulse, "h-12 w-full")} />
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="relative size-10" aria-hidden>
      <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
      <div className="absolute inset-0 motion-safe:animate-spin rounded-full border-2 border-transparent border-t-primary" />
    </div>
  );
}

export interface PublicPlanResultsLoadingProps {
  count?: number;
  message?: string;
}

export function PublicPlanResultsLoading({
  count = PLAN_LOADING_SKELETON_COUNT,
  message = "Buscando los mejores planes para ti…",
}: PublicPlanResultsLoadingProps) {
  return (
    <div
      className="flex flex-col gap-4 motion-safe:animate-fade-in"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-white/80 px-6 py-7 text-center">
        <LoadingSpinner />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary-dark">{message}</p>
          <p className="text-xs text-muted">Comparando precios y coberturas</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, index) => (
          <PlanCardSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
}

export function PublicPlanResultsLoadingInline({
  message = "Actualizando resultados…",
}: {
  message?: string;
}) {
  return (
    <div
      className={joinClasses(
        "flex items-center justify-center gap-3 rounded-xl border bg-white px-4 py-3",
        ui.border,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner />
      <p className="text-sm font-medium text-muted">{message}</p>
    </div>
  );
}
