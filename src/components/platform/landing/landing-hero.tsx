"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { landing } from "./landing-tokens";
import { LandingHeroVisual } from "./landing-hero-visual";

const TRUST_ITEMS = [
  "Comparación instantánea",
  "Asesoría personalizada",
  "100% sin compromiso",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      delay,
    },
  }),
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-primary" aria-hidden>
      <path
        d="M3 8l3.5 3.5L13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      aria-hidden
    >
      <path
        d="M4 10h12M11 5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingHero() {
  const reducedMotion = useReducedMotion();

  const motionProps = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: "hidden" as const,
          animate: "visible" as const,
          custom: delay,
          variants: fadeUp,
        };

  return (
    <section className={landing.heroSection} aria-labelledby="landing-hero-title">
      {/* Fondos decorativos */}
      <div className="landing-hero-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-80" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 18%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      <div className={landing.heroInner}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Copy */}
          <div className="relative z-10 max-w-2xl">
            <motion.div {...motionProps(0)}>
              <span className={landing.badge}>
                <span className="relative flex h-2 w-2">
                  {!reducedMotion ? (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                  ) : null}
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Asesoría Isapre · Chile
              </span>
            </motion.div>

            <motion.h1
              id="landing-hero-title"
              {...motionProps(0.08)}
              className={`${landing.headline} mt-6`}
            >
              El plan de salud que necesitas, con la confianza que mereces
            </motion.h1>

            <motion.p {...motionProps(0.16)} className={landing.subheadline}>
              Compara precios y coberturas de las principales Isapres en segundos.
              Nuestros expertos te acompañan para elegir la mejor opción para ti
              y tu familia.
            </motion.p>

            <motion.div
              {...motionProps(0.24)}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/cotizador" className={landing.ctaPrimary}>
                Cotizar mi plan gratis
                <ArrowIcon />
              </Link>
              <Link href="/cotizador" className={landing.ctaSecondary}>
                Explorar planes
              </Link>
            </motion.div>

            <motion.ul
              {...motionProps(0.32)}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              {TRUST_ITEMS.map((item) => (
                <li key={item} className={landing.trustPill}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div
              {...motionProps(0.4)}
              className="mt-12 grid grid-cols-3 gap-4 border-t border-border/60 pt-8 sm:gap-8"
            >
              {[
                { value: "6+", label: "Isapres comparadas" },
                { value: "Gratis", label: "Sin costo oculto" },
                { value: "Expertos", label: "Asesores certificados" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-muted sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 28,
              delay: 0.2,
            }}
            className="relative z-10 lg:pl-4"
          >
            <LandingHeroVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
