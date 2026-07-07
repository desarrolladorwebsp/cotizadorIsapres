"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlanCatalogClinicOption } from "@/lib/api/plan-clinics";
import { textIncludesSearch } from "@/lib/normalize-search-text";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface ClinicPickerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: PlanCatalogClinicOption[];
  value: string | null;
  onSelect: (clinicId: string) => void;
  loading?: boolean;
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClinicPickerModal({
  open,
  onClose,
  title,
  options,
  value,
  onSelect,
  loading = false,
}: ClinicPickerModalProps) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const timer = window.setTimeout(() => searchRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return options;

    return options.filter(
      (option) =>
        textIncludesSearch(option.name, normalizedQuery) ||
        textIncludesSearch(option.id, normalizedQuery),
    );
  }, [options, query]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary-dark/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Cerrar selector de prestador"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinic-picker-modal-title"
        className={joinClasses(
          "relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:rounded-2xl",
          ui.border,
        )}
      >
        <div className="shrink-0 bg-primary-dark px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="clinic-picker-modal-title"
              className="text-base font-bold leading-snug text-white sm:text-lg"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={joinClasses(
                "shrink-0 rounded-lg text-white/75 transition hover:bg-white/10 hover:text-white",
                touchTarget,
              )}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="relative mt-3 sm:mt-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar prestador…"
              disabled={loading}
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-white/15 bg-white/12 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/25"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-bg-layout/70 p-3 sm:p-5">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">
              Cargando prestadores…
            </p>
          ) : filteredOptions.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              No hay prestadores que coincidan con tu búsqueda.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredOptions.map((option, index) => {
                const isSelected = option.id === value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.id)}
                    className={joinClasses(
                      "group relative flex min-h-[4.75rem] flex-col items-center justify-center rounded-lg border bg-white px-2 py-3 text-center text-xs font-medium leading-snug text-foreground transition sm:min-h-[5rem] sm:text-[13px]",
                      ui.borderHairline,
                      "hover:border-primary hover:shadow-sm hover:ring-2 hover:ring-primary/20",
                      isSelected &&
                        "border-primary bg-primary/5 font-semibold text-primary-dark ring-2 ring-primary/30",
                    )}
                  >
                    <span className="absolute right-1.5 top-1 text-[10px] tabular-nums text-muted/45">
                      {index + 1}
                    </span>
                    <span className="line-clamp-3 px-1">{option.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
