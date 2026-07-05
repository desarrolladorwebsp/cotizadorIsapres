"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { formatGesLabel, type LandingIsapreItem } from "./landing-isapres-data";

interface LandingIsapreCardProps {
  item: LandingIsapreItem;
}

export function LandingIsapreCard({ item }: LandingIsapreCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={
        reducedMotion
          ? undefined
          : { y: -6, transition: { type: "spring", stiffness: 380, damping: 28 } }
      }
      className="landing-isapre-card landing-glass-panel-strong relative mt-14 flex h-full flex-col rounded-3xl border border-border/70 p-7 pt-16 text-center sm:p-8 sm:pt-16"
    >
      <div className="absolute -top-12 left-1/2 z-10 flex h-24 w-24 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background p-2 shadow-card">
        {item.logoSrc ? (
          <div className="relative h-full w-full">
            <Image
              src={item.logoSrc}
              alt={`Logo ${item.title}`}
              fill
              className="object-contain p-1.5"
              sizes="96px"
            />
          </div>
        ) : (
          <span className="text-lg font-bold text-primary-dark">
            {item.title.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-base font-bold uppercase tracking-wide text-foreground sm:text-lg">
          {item.title}
        </h3>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          GES actual:{" "}
          <span className="text-primary">{formatGesLabel(item.gesUf)}</span>
        </p>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
          {item.description}
        </p>

        <Link
          href="#cotizar"
          className="group/more mx-auto mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/8 text-xl font-light leading-none text-primary transition-colors hover:border-primary/40 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          aria-label={`Cotizar planes de ${item.title}`}
        >
          +
        </Link>
      </div>
    </motion.article>
  );
}
