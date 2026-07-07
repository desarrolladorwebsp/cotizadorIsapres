"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PlanCatalogClinicOption } from "@/lib/api/plan-clinics";
import { ClinicPickerModal } from "./clinic-picker-modal";

export interface ClinicFilterSelectProps {
  value: string | null;
  onChange: (clinicId: string | null) => void;
  options: PlanCatalogClinicOption[];
  loading?: boolean;
  error?: string | null;
  showSelectedHint?: boolean;
  modalTitle?: string;
  compactEmbed?: boolean;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden>
      <path
        d="M8 10l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0" aria-hidden>
      <path
        d="M4 20V8l8-4 8 4v12M9 20v-5h6v5M9 12h.01M15 12h.01M9 16h.01M15 16h.01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClinicFilterSelect({
  value,
  onChange,
  options,
  loading = false,
  error = null,
  showSelectedHint = false,
  modalTitle = "Seleccionar prestador",
  compactEmbed = false,
}: ClinicFilterSelectProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  function handleSelect(clinicId: string) {
    onChange(clinicId);
    setModalOpen(false);
  }

  function handleClear(event: MouseEvent) {
    event.stopPropagation();
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        disabled={loading}
        className={joinClasses(
          "flex w-full items-center gap-2 rounded-lg border bg-white px-3 text-left transition",
          compactEmbed ? "min-h-10 py-2 text-xs" : "min-h-11 py-2.5 text-sm",
          ui.borderHairline,
          ui.hoverSurface,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          loading && "cursor-wait opacity-70",
        )}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
      >
        <span className="text-primary-dark/70">
          <BuildingIcon />
        </span>
        <span
          className={joinClasses(
            "min-w-0 flex-1 truncate",
            selected ? "font-medium text-foreground" : "text-muted",
          )}
        >
          {loading
            ? "Cargando prestadores…"
            : selected
              ? selected.name
              : "Seleccionar prestador…"}
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onChange(null);
              }
            }}
            className={joinClasses(
              "shrink-0 rounded-md px-2 text-[11px] font-semibold text-muted hover:bg-surface-hover hover:text-foreground",
              touchTarget,
            )}
            aria-label="Quitar filtro de clínica"
          >
            Quitar
          </span>
        ) : (
          <span className="shrink-0 text-muted/70">
            <ChevronIcon />
          </span>
        )}
      </button>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {showSelectedHint && selected ? (
        <p className="text-[11px] text-muted">
          Mostrando planes con cobertura en{" "}
          <span className="font-medium text-foreground">{selected.name}</span>.
        </p>
      ) : null}

      <ClinicPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        options={options}
        value={value}
        onSelect={handleSelect}
        loading={loading}
      />
    </div>
  );
}
