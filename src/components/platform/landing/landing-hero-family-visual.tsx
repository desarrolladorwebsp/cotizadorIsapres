"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  LANDING_FAMILY_HERO_ALT,
  LANDING_FAMILY_HERO_IMAGE,
} from "./landing-visual-config";

/** Visual principal del Hero — familia protegida y tranquila. */
export function LandingHeroFamilyVisual() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="landing-hero-family relative w-full">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, x: 28, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 28,
          delay: 0.15,
        }}
        className="landing-hero-family-frame relative overflow-hidden rounded-3xl border border-white/60 shadow-card"
      >
        <div className="relative aspect-[4/5] min-h-[320px] sm:aspect-[5/6] sm:min-h-[380px] lg:aspect-[4/5] lg:min-h-[480px] xl:min-h-[540px]">
          <Image
            src={LANDING_FAMILY_HERO_IMAGE}
            alt={LANDING_FAMILY_HERO_ALT}
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={92}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/35 via-transparent to-transparent" />
        </div>

        <div className="landing-hero-family-caption absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="landing-glass-panel-strong rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4">
            <p className="text-sm font-semibold text-foreground sm:text-base">
              Salud que protege a quienes más quieres
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
              Tranquilidad para tu familia, con el respaldo de asesores certificados.
            </p>
          </div>
        </div>
      </motion.div>

      <div
        className="landing-hero-family-glow pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
        aria-hidden
      />
    </div>
  );
}
