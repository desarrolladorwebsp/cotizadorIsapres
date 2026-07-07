"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { touchTarget } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { PlanCatalogClinicOption } from "@/lib/api/plan-clinics";
import {
  textEqualsSearch,
  textIncludesSearch,
} from "@/lib/normalize-search-text";

export interface ClinicFilterSelectProps {
  value: string | null;
  onChange: (clinicId: string | null) => void;
  options: PlanCatalogClinicOption[];
  loading?: boolean;
  error?: string | null;
}

const MAX_VISIBLE_OPTIONS = 8;

export function ClinicFilterSelect({
  value,
  onChange,
  options,
  loading = false,
  error = null,
}: ClinicFilterSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (selected) {
      setQuery(selected.name);
    } else if (!open) {
      setQuery("");
    }
  }, [selected, open]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim();
    if (
      !normalizedQuery ||
      (selected && textEqualsSearch(selected.name, normalizedQuery))
    ) {
      return options.slice(0, MAX_VISIBLE_OPTIONS);
    }

    return options
      .filter(
        (option) =>
          textIncludesSearch(option.name, normalizedQuery) ||
          textIncludesSearch(option.id, normalizedQuery),
      )
      .slice(0, MAX_VISIBLE_OPTIONS);
  }, [options, query, selected]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleClear() {
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  function handleSelect(option: PlanCatalogClinicOption) {
    onChange(option.id);
    setQuery(option.name);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative space-y-2">
      <div className="relative">
        <Input
          type="search"
          value={query}
          placeholder={loading ? "Cargando clínicas…" : "Buscar clínica…"}
          disabled={loading}
          autoComplete="off"
          aria-expanded={open}
          aria-controls="clinic-filter-listbox"
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            if (value) onChange(null);
            setOpen(true);
          }}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className={joinClasses(
              "absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 text-xs font-medium text-muted hover:bg-surface-hover hover:text-foreground",
              touchTarget,
            )}
            aria-label="Quitar filtro de clínica"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {open && !loading && filteredOptions.length > 0 ? (
        <ul
          id="clinic-filter-listbox"
          role="listbox"
          className="absolute z-30 max-h-52 w-full overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg"
        >
          {filteredOptions.map((option) => {
            const isSelected = option.id === value;
            return (
              <li key={option.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={joinClasses(
                    "flex w-full items-start px-3 py-2 text-left text-sm transition hover:bg-surface-hover",
                    isSelected && "bg-primary/5 font-semibold text-primary-dark",
                  )}
                >
                  {option.name}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {open && !loading && query.trim() && filteredOptions.length === 0 ? (
        <p className="text-xs text-muted">No hay clínicas que coincidan.</p>
      ) : null}

      {selected ? (
        <p className="text-[11px] text-muted">
          Mostrando planes con cobertura en{" "}
          <span className="font-medium text-foreground">{selected.name}</span>.
        </p>
      ) : null}
    </div>
  );
}
