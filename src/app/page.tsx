"use client";

import { useMemo, useState } from "react";
import planesData from "@/assets/planes.json";
import { BeneficiariesForm } from "@/components/beneficiaries";
import { PlanCard } from "@/components/plan-card";
import { buildBeneficiaryGroupSummary } from "@/lib/beneficiary-summary";
import { formatPlanClp, formatPlanUf } from "@/lib/plan-format";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type {
  BeneficiaryGroupSummary,
  FamilyBeneficiariesState,
} from "@/types/beneficiary";
import type { HealthPlan } from "@/types/plan";

const UF_TO_CLP = 38_500;

const STATIC_ISAPRES = [
  { id: "banmedica", label: "Banmédica" },
  { id: "colmena", label: "Colmena" },
  { id: "consalud", label: "Consalud" },
  { id: "cruz-blanca", label: "Cruz Blanca" },
  { id: "esencial", label: "Esencial" },
  { id: "nueva-masvida", label: "Nueva Masvida" },
  { id: "vida-tres", label: "Vida Tres" },
];

const STATIC_ZONAS = [
  { id: "rm-norte", label: "RM Norte" },
  { id: "rm-sur", label: "RM Sur" },
  { id: "rm-oriente", label: "RM Oriente" },
  { id: "rm-poniente", label: "RM Poniente" },
  { id: "rm-centro", label: "RM Centro" },
  { id: "valparaiso", label: "Valparaíso" },
  { id: "biobio", label: "Biobío" },
];

const INITIAL_BENEFICIARIES: FamilyBeneficiariesState = {
  contributorAge: 34,
  dependents: [{ id: "initial-dependent", age: 32 }],
};

function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={joinClasses(
        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground transition",
        ui.hoverSurface,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 rounded border-border accent-[hsl(var(--brand))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

function FilterCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={joinClasses(ui.card, "p-5 sm:p-6")}>
      <header className="mb-5 space-y-1">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState(3);
  const [priceMax, setPriceMax] = useState(5);
  const [sortAsc, setSortAsc] = useState(true);
  const [beneficiaries, setBeneficiaries] =
    useState<FamilyBeneficiariesState>(INITIAL_BENEFICIARIES);
  const [beneficiarySummary, setBeneficiarySummary] =
    useState<BeneficiaryGroupSummary>(() =>
      buildBeneficiaryGroupSummary(INITIAL_BENEFICIARIES),
    );
  const [selectedIsapres, setSelectedIsapres] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        STATIC_ISAPRES.map((item) => [item.id, item.id === "consalud"]),
      ),
  );
  const [selectedZonas, setSelectedZonas] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        STATIC_ZONAS.map((item) => [
          item.id,
          item.id === "rm-oriente" || item.id === "rm-centro",
        ]),
      ),
  );

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const plans = (planesData as HealthPlan[]).filter((plan) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        plan.plan_name.toLowerCase().includes(normalizedSearch) ||
        plan.unique_code.toLowerCase().includes(normalizedSearch) ||
        plan.isapre.toLowerCase().includes(normalizedSearch);

      const matchesPrice =
        plan.base_price_uf >= priceMin && plan.base_price_uf <= priceMax;

      return matchesSearch && matchesPrice;
    });

    return plans.sort((a, b) =>
      sortAsc
        ? a.base_price_uf - b.base_price_uf
        : b.base_price_uf - a.base_price_uf,
    );
  }, [search, priceMin, priceMax, sortAsc]);

  function toggleIsapre(id: string, checked: boolean) {
    setSelectedIsapres((prev) => ({ ...prev, [id]: checked }));
  }

  function toggleZona(id: string, checked: boolean) {
    setSelectedZonas((prev) => ({ ...prev, [id]: checked }));
  }

  function handleBeneficiariesChange(
    next: FamilyBeneficiariesState,
    summary: BeneficiaryGroupSummary,
  ) {
    setBeneficiaries(next);
    setBeneficiarySummary(summary);
  }

  return (
    <div className={joinClasses("flex min-h-screen flex-col", ui.canvas)}>
      <header
        className={joinClasses(
          "sticky top-0 z-30 border-b bg-background",
          ui.border,
        )}
      >
        <div className="flex h-[4.5rem] items-center gap-6 px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className={joinClasses(
              "inline-flex size-9 items-center justify-center rounded-lg text-muted transition lg:hidden",
              ui.borderHairline,
              ui.hoverSurface,
            )}
            aria-label={sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex min-w-0 items-center gap-4">
            <div
              className={joinClasses(
                "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-brand",
                ui.borderHairline,
              )}
            >
              CI
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                Cotizador Inteligente
              </p>
              <p className="truncate text-xs text-muted">Comparador de planes Isapre</p>
            </div>
          </div>

          <div className="mx-auto hidden max-w-md flex-1 justify-center md:flex">
            <div
              className={joinClasses(
                "inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm",
                ui.borderHairline,
              )}
            >
              <span className="size-1.5 rounded-full bg-action" />
              <span className="text-muted">Cotización activa</span>
              <span className="font-medium tracking-tight text-foreground">
                #CI-2406
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium tracking-tight text-foreground">
                Alfredo Hurtado
              </p>
              <p className="text-xs text-muted">Ejecutivo comercial</p>
            </div>
            <div
              className={joinClasses(
                "flex size-10 items-center justify-center rounded-full text-sm font-medium text-muted",
                ui.borderHairline,
              )}
              aria-hidden
            >
              AH
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={joinClasses(
            "shrink-0 border-r bg-background transition-[width,transform] duration-300 ease-out",
            ui.border,
            sidebarOpen
              ? "w-[min(100vw,22rem)] translate-x-0"
              : "w-0 -translate-x-full overflow-hidden border-r-0 lg:w-0",
            "fixed inset-y-[4.5rem] left-0 z-20 lg:static lg:inset-auto lg:translate-x-0",
            !sidebarOpen && "pointer-events-none lg:pointer-events-auto",
          )}
        >
          <div className="flex h-full w-[min(100vw,22rem)] flex-col">
            <div
              className={joinClasses(
                "flex items-center justify-between border-b px-6 py-5 lg:px-8",
                ui.border,
              )}
            >
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Filtros
              </p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className={joinClasses(
                  "hidden rounded-lg px-2 py-1 text-xs text-muted transition lg:inline-flex",
                  ui.hoverSurface,
                )}
              >
                Ocultar
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
              <BeneficiariesForm
                value={beneficiaries}
                onChange={handleBeneficiariesChange}
              />

              <FilterCard
                title="Isapres"
                description="Selección rápida de prestadores."
              >
                <div className="space-y-0.5">
                  {STATIC_ISAPRES.map((item) => (
                    <FilterCheckbox
                      key={item.id}
                      id={`isapre-${item.id}`}
                      label={item.label}
                      checked={Boolean(selectedIsapres[item.id])}
                      onChange={(checked) => toggleIsapre(item.id, checked)}
                    />
                  ))}
                </div>
              </FilterCard>

              <FilterCard title="Zonas" description="Cobertura geográfica.">
                <div className="max-h-48 space-y-0.5 overflow-y-auto pr-1">
                  {STATIC_ZONAS.map((item) => (
                    <FilterCheckbox
                      key={item.id}
                      id={`zona-${item.id}`}
                      label={item.label}
                      checked={Boolean(selectedZonas[item.id])}
                      onChange={(checked) => toggleZona(item.id, checked)}
                    />
                  ))}
                </div>
              </FilterCard>
            </div>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Cerrar panel de filtros"
            className="fixed inset-0 z-10 bg-foreground/[0.04] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-10">
            <section
              className={joinClasses(
                "grid gap-8 border-b pb-10 lg:grid-cols-[1fr_minmax(16rem,20rem)_auto] lg:items-end",
                ui.border,
              )}
            >
              <div className="space-y-2">
                <label
                  htmlFor="plan-search"
                  className="text-xs font-medium text-muted"
                >
                  Buscar planes
                </label>
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted/60"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                  <input
                    id="plan-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Nombre, código o Isapre..."
                    className={joinClasses(
                      "h-11 w-full rounded-lg py-2 pl-10 pr-4 text-sm",
                      ui.input,
                    )}
                  />
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted">Rango de precio</span>
                  <span className="tabular-nums text-muted/80">
                    {formatPlanUf(priceMin)} – {formatPlanUf(priceMax)}
                  </span>
                </div>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={priceMin}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPriceMin(Math.min(value, priceMax));
                    }}
                    className="h-px w-full cursor-pointer appearance-none rounded-full bg-border accent-brand [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-background"
                  />
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={0.1}
                    value={priceMax}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPriceMax(Math.max(value, priceMin));
                    }}
                    className="h-px w-full cursor-pointer appearance-none rounded-full bg-border accent-brand [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-border [&::-webkit-slider-thumb]:bg-background"
                  />
                </div>
                <p className="text-[11px] text-muted/80">
                  Aprox. {formatPlanClp(priceMin * UF_TO_CLP)} –{" "}
                  {formatPlanClp(priceMax * UF_TO_CLP)} en pesos
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSortAsc((value) => !value)}
                className={joinClasses(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-foreground transition",
                  ui.ctaOutline,
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-4 text-muted"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path
                    d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l3 3M17 4l-3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {sortAsc ? "Menor a Mayor" : "Mayor a Menor"}
              </button>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">
                  {filteredPlans.length}
                </span>{" "}
                planes encontrados
                <span className="mx-2 text-border">·</span>
                <span className="text-foreground/80">
                  Factor total grupo:{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {beneficiarySummary.totalFactors.toLocaleString("es-CL", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </span>
              </p>
              {!sidebarOpen ? (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className={joinClasses("text-sm font-medium", ui.link)}
                >
                  Mostrar filtros
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-6">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan.unique_code}
                  plan={plan}
                  ufToClp={UF_TO_CLP}
                  badges={plan.has_top ? ["Top", "Preferente"] : undefined}
                />
              ))}
            </div>

            {filteredPlans.length === 0 ? (
              <div
                className={joinClasses(
                  "rounded-xl border border-dashed px-8 py-20 text-center",
                  ui.border,
                )}
              >
                <p className="text-base font-medium text-foreground">
                  Sin resultados para los filtros actuales
                </p>
                <p className="mt-1 text-sm text-muted">
                  Ajusta el rango de precio o el término de búsqueda.
                </p>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
