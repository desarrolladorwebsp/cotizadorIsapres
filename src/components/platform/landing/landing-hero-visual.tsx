"use client";

import { motion, useReducedMotion } from "framer-motion";

const MOCK_PLANS = [
  {
    name: "Plan Preferente",
    isapre: "Colmena",
    price: "$89.990",
    coverage: 82,
    highlight: true,
  },
  {
    name: "Plan Clásico",
    isapre: "Consalud",
    price: "$72.450",
    coverage: 74,
    highlight: false,
  },
] as const;

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M12 2l8 4v6c0 5.25-3.5 10-8 12-4.5-2-8-6.75-8-12V6l8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanCard({
  plan,
  index,
  reducedMotion,
}: {
  plan: (typeof MOCK_PLANS)[number];
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay: 0.35 + index * 0.12,
      }}
      className={[
        "landing-glass-panel-strong landing-hero-visual rounded-2xl p-5",
        plan.highlight ? "ring-1 ring-primary/25" : "",
        index === 1 ? "absolute -bottom-6 -left-4 w-[88%] scale-[0.92] opacity-90 sm:-left-8" : "relative z-10",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {plan.isapre}
          </p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {plan.name}
          </p>
        </div>
        {plan.highlight ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-dark">
            Recomendado
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {plan.price}
            <span className="text-sm font-medium text-muted">/mes</span>
          </p>
          <p className="text-xs font-medium text-muted">
            {plan.coverage}% cobertura
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-layout">
          <motion.div
            initial={reducedMotion ? false : { width: 0 }}
            animate={{ width: `${plan.coverage}%` }}
            transition={{
              duration: 0.9,
              ease: "easeOut",
              delay: 0.6 + index * 0.15,
            }}
            className="h-full rounded-full bg-coverage-gradient"
          />
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {["Hospitalización", "Ambulatorio", "Dental"].map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-xs text-muted"
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
                <path
                  d="M2.5 6l2.5 2.5 4.5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function LandingHeroVisual() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Glow decorativo */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-full opacity-60 blur-3xl"
        style={{ boxShadow: "var(--landing-hero-glow)" }}
        aria-hidden
      />

      {/* Badge flotante superior */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.55 }}
        className="landing-glass-panel absolute -right-2 top-0 z-20 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 sm:-right-6"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Cobertura verificada
          </p>
          <p className="text-sm font-bold text-foreground">+6 Isapres</p>
        </div>
      </motion.div>

      {/* Tarjetas de planes */}
      <div className="relative pt-8 pb-10 pl-4 sm:pl-8">
        <PlanCard plan={MOCK_PLANS[0]} index={0} reducedMotion={!!reducedMotion} />
        <PlanCard plan={MOCK_PLANS[1]} index={1} reducedMotion={!!reducedMotion} />
      </div>

      {/* Stat flotante inferior */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.7 }}
        className="landing-glass-panel absolute -bottom-2 left-0 z-20 flex items-center gap-3 rounded-2xl px-4 py-3 sm:-bottom-4 sm:left-4"
      >
        <div className="flex -space-x-2">
          {["C", "B", "V"].map((letter, i) => (
            <span
              key={letter}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-primary-foreground"
              style={{
                background:
                  i === 0
                    ? "var(--primary)"
                    : i === 1
                      ? "var(--secondary)"
                      : "var(--primary-dark)",
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">
            Comparación en segundos
          </p>
          <p className="text-[11px] text-muted">Resultados personalizados</p>
        </div>
      </motion.div>
    </div>
  );
}
