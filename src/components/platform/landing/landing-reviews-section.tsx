"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicPlanReview } from "@/types/plan-review";
import { joinClasses } from "@/lib/utils";
import { landing } from "./landing-tokens";

interface LandingReviewsSectionProps {
  reviews: PublicPlanReview[];
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

const BENTO_LAYOUTS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-1 lg:row-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
] as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatReviewDate(isoDate: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function ExecutiveStarRating({ rating }: { rating: number }) {
  const safeRating = Math.min(Math.max(Math.round(rating), 1), 5);

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Calificación de atención del ejecutivo: ${safeRating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < safeRating;
        return (
          <svg
            key={index}
            viewBox="0 0 20 20"
            className={joinClasses(
              "size-4 shrink-0 sm:size-[18px]",
              filled ? "text-amber-400" : "text-slate-200",
            )}
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        );
      })}
    </div>
  );
}

function ReviewAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "size-14 text-lg" : "size-11 text-sm";

  if (avatarUrl) {
    return (
      <div
        className={joinClasses(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white/80",
          sizeClass,
        )}
      >
        <Image
          src={avatarUrl}
          alt=""
          fill
          className="object-cover"
          sizes={size === "lg" ? "56px" : "44px"}
        />
      </div>
    );
  }

  return (
    <div
      className={joinClasses(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/25 font-bold text-primary-dark ring-2 ring-white/80",
        sizeClass,
      )}
      aria-hidden
    >
      {getInitials(name) || "?"}
    </div>
  );
}

function ReviewCard({
  review,
  layoutClassName,
  size = "md",
  reducedMotion,
}: {
  review: PublicPlanReview;
  layoutClassName?: string;
  size?: "md" | "lg";
  reducedMotion: boolean;
}) {
  const isLarge = size === "lg";

  return (
    <motion.article
      variants={itemVariants}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -8,
              scale: 1.015,
              transition: { type: "spring", stiffness: 420, damping: 26 },
            }
      }
      className={joinClasses(
        "landing-review-card landing-glass-panel-strong group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl p-5 sm:p-6",
        layoutClassName,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-secondary/10 blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <header className="relative flex items-start gap-3">
        <ReviewAvatar
          name={review.authorName}
          avatarUrl={review.authorAvatarUrl}
          size={isLarge ? "lg" : "md"}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground sm:text-base">
            {review.authorName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {formatReviewDate(review.createdAt)}
          </p>
        </div>
      </header>

      <div className="relative mt-4 rounded-2xl border border-primary/10 bg-primary/[0.04] px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-dark/70">
          Plan seleccionado
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-foreground">
          {review.planName}
        </p>
        <p className="mt-0.5 text-xs text-muted">{review.isapreName}</p>
      </div>

      <div className="relative mt-4 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          Atención del ejecutivo
        </p>
        <ExecutiveStarRating rating={review.executiveRating} />
      </div>

      <blockquote
        className={joinClasses(
          "relative mt-4 flex-1 text-pretty leading-relaxed text-foreground/90",
          isLarge ? "text-base sm:text-[1.05rem]" : "text-sm sm:text-[0.95rem]",
        )}
      >
        <span className="text-primary/35" aria-hidden>
          "
        </span>
        {review.comment}
        <span className="text-primary/35" aria-hidden>
          "
        </span>
      </blockquote>
    </motion.article>
  );
}

function ReviewsMobileCarousel({
  reviews,
  reducedMotion,
}: {
  reviews: PublicPlanReview[];
  reducedMotion: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const loopReviews = useMemo(() => [...reviews, ...reviews], [reviews]);

  const resumeAutoScroll = useCallback(() => {
    window.setTimeout(() => setIsPaused(false), 2400);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion || isPaused || reviews.length < 2) return;

    let frameId = 0;
    let lastTimestamp = performance.now();
    const pixelsPerSecond = 36;

    function tick(timestamp: number) {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (track) {
        track.scrollLeft += (pixelsPerSecond * delta) / 1000;
        const loopWidth = track.scrollWidth / 2;
        if (track.scrollLeft >= loopWidth) {
          track.scrollLeft -= loopWidth;
        }
      }

      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isPaused, reducedMotion, reviews.length]);

  return (
    <div className="relative -mx-4 sm:-mx-6">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--landing-section-surface)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--landing-section-surface)] to-transparent"
        aria-hidden
      />

      <div
        ref={trackRef}
        className="landing-reviews-mobile-track flex gap-4 overflow-x-auto px-4 pb-3 pt-1 snap-x snap-mandatory scroll-smooth sm:px-6"
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={resumeAutoScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={resumeAutoScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Carrusel de reseñas de clientes"
      >
        {loopReviews.map((review, index) => (
          <div
            key={`${review.id}-${index}`}
            className="w-[min(86vw,320px)] shrink-0 snap-center"
          >
            <ReviewCard review={review} reducedMotion={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingReviewsSection({ reviews }: LandingReviewsSectionProps) {
  const reducedMotion = useReducedMotion();

  if (reviews.length === 0) {
    return null;
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.executiveRating, 0) /
    reviews.length;

  return (
    <section
      id="reseñas"
      className={`${landing.sectionSurface} relative overflow-hidden`}
      aria-labelledby="landing-reviews-title"
    >
      <div className="landing-reviews-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-35" aria-hidden />

      <div className={`${landing.container} relative py-20 sm:py-24 lg:py-28`}>
        <motion.div
          initial={reducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span variants={itemVariants} className={landing.badge}>
            Comentarios y reseñas
          </motion.span>
          <motion.h2
            id="landing-reviews-title"
            variants={itemVariants}
            className={`${landing.headline} mt-5`}
          >
            Lo que dicen quienes ya cotizaron con nosotros
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="premium-text-secondary mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
          >
            Experiencias reales de clientes que compararon planes y recibieron
            asesoría personalizada de nuestros ejecutivos.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border border-primary/15 bg-white/70 px-4 py-2 shadow-sm"
          >
            <ExecutiveStarRating rating={Math.round(averageRating)} />
            <span className="text-sm font-semibold text-foreground">
              {averageRating.toFixed(1)} / 5
            </span>
            <span className="text-sm text-muted">
              · {reviews.length} reseñas
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={sectionVariants}
          className="mt-14 hidden auto-rows-fr grid-cols-1 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              size={index === 0 ? "lg" : "md"}
              layoutClassName={BENTO_LAYOUTS[index % BENTO_LAYOUTS.length]}
              reducedMotion={Boolean(reducedMotion)}
            />
          ))}
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
          className="mt-12 md:hidden"
        >
          <ReviewsMobileCarousel
            reviews={reviews}
            reducedMotion={Boolean(reducedMotion)}
          />
          <p className="mt-3 text-center text-xs text-muted">
            Desliza horizontalmente para explorar más reseñas
          </p>
        </motion.div>
      </div>
    </section>
  );
}
