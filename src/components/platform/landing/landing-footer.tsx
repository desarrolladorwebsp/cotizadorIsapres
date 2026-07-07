"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { landing } from "./landing-tokens";
import { LandingLogo } from "./landing-logo";
import {
  LANDING_FOOTER_CONTACT,
  LANDING_FOOTER_DESCRIPTION,
  LANDING_FOOTER_NAV,
  LANDING_FOOTER_SMARTPRO_URL,
  LANDING_FOOTER_SOCIAL,
} from "./landing-footer-data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 30, delay },
  }),
};

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6.5 4h3l1.5 5-2 1.5a13 13 0 005 5L17.5 14l5 1.5v3a1.5 1.5 0 01-1.5 1.5A15 15 0 013 6.5 1.5 1.5 0 014.5 5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function SocialIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M14 8h2.5V5.5H14c-2.2 0-3.5 1.3-3.5 3.6V11H8v2.7h2.5V21h3.1v-7.3H16l.5-2.7h-2.4V9.2c0-.8.2-1.2 1.2-1.2z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M12 2a9.8 9.8 0 00-8.4 14.8L2 22l5.4-1.4A9.8 9.8 0 1012 2zm0 1.8a8 8 0 018 8.2c0 4.4-3.6 8-8 8a7.9 7.9 0 01-4-.9l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 0112 3.8zm-2.3 4.5c-.1 0-.3.1-.4.3-.2.2-.7.7-.7 1.6 0 .9.7 1.9 1 2.1.1.1 1.2 1.9 3 2.6 1.5.6 1.8.5 2.1.5.3 0 1-.4 1.1-.8.1-.4.1-.8.1-.8s0-.1-.1-.2-.2-.1-.3-.1-.8-.3-1-.4-.2-.1-.3-.1-.1.2-.3.4-.5.5-.6.5s-.3 0-.6-.2c-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.1-.3 0-.4.1-.6.1-.1.1-.2.2-.3.1-.1.1-.2.1-.3 0-.1 0-.2-.1-.3l-.4-.9c-.1-.2-.2-.3-.3-.3z" />
        </svg>
      );
    default:
      return null;
  }
}

function FooterNavLink({
  href,
  label,
  reducedMotion,
}: {
  href: string;
  label: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.li whileHover={reducedMotion ? undefined : { x: 4 }}>
      <a
        href={href}
        className="group inline-flex items-center gap-2 text-sm premium-text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-lg"
      >
        <span className="h-1 w-1 rounded-full bg-primary/40 transition-all group-hover:w-2 group-hover:bg-primary" aria-hidden />
        {label}
      </a>
    </motion.li>
  );
}

function SocialLink({
  id,
  label,
  href,
  reducedMotion,
}: {
  id: string;
  label: string;
  href: string;
  reducedMotion: boolean;
}) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      title={label}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={
        reducedMotion
          ? undefined
          : { y: -3, scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 22 } }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted shadow-sm transition-colors hover:border-primary/30 hover:bg-secondary-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <SocialIcon id={id} className="h-[18px] w-[18px]" />
    </motion.a>
  );
}

export function LandingFooter() {
  const reducedMotion = useReducedMotion();
  const motionProps = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, margin: "-40px" },
          custom: delay,
          variants: fadeUp,
        };

  return (
    <footer
      id="contacto"
      className={`${landing.sectionSurface} relative overflow-hidden border-t border-border/80`}
      aria-labelledby="landing-footer-heading"
    >
      <div className="landing-footer-mesh pointer-events-none absolute inset-0" aria-hidden />
      <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-20" aria-hidden />

      <div className={`${landing.container} relative py-16 sm:py-20`}>
        <h2 id="landing-footer-heading" className="sr-only">
          Pie de página — Cotizador Premium
        </h2>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <motion.div {...motionProps(0)} className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <LandingLogo size="lg" className="rounded-2xl" />
              <div>
                <p className="text-lg font-bold tracking-tight text-foreground">
                  Cotizador Premium
                </p>
                <p className="text-xs text-muted">Salud prepaga en Chile</p>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed premium-text-secondary">
              {LANDING_FOOTER_DESCRIPTION}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {LANDING_FOOTER_SOCIAL.map((social) => (
                <SocialLink
                  key={social.id}
                  {...social}
                  reducedMotion={!!reducedMotion}
                />
              ))}
            </div>
          </motion.div>

          <motion.nav {...motionProps(0.08)} aria-label="Enlaces rápidos" className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Navegación
            </p>
            <ul className="mt-4 space-y-3">
              {LANDING_FOOTER_NAV.map((item) => (
                <FooterNavLink
                  key={item.href}
                  {...item}
                  reducedMotion={!!reducedMotion}
                />
              ))}
            </ul>
          </motion.nav>

          <motion.div {...motionProps(0.16)} className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Contacto
            </p>
            <ul className="mt-4 space-y-4">
              <li>
                <motion.a
                  href={`mailto:${LANDING_FOOTER_CONTACT.email}`}
                  whileHover={reducedMotion ? undefined : { x: 4 }}
                  className="group flex items-start gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-border/80 hover:bg-secondary-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-muted text-primary">
                    <MailIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-muted">Correo</span>
                    <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {LANDING_FOOTER_CONTACT.email}
                    </span>
                  </span>
                </motion.a>
              </li>
              <li>
                <motion.a
                  href={LANDING_FOOTER_CONTACT.phoneHref}
                  whileHover={reducedMotion ? undefined : { x: 4 }}
                  className="group flex items-start gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-border/80 hover:bg-secondary-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-muted text-primary">
                    <PhoneIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-muted">Teléfono</span>
                    <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {LANDING_FOOTER_CONTACT.phone}
                    </span>
                  </span>
                </motion.a>
              </li>
              <li>
                <div className="flex items-start gap-3 rounded-2xl p-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-muted text-primary">
                    <PinIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-muted">Ubicación</span>
                    <span className="text-sm font-semibold text-foreground">
                      {LANDING_FOOTER_CONTACT.location}
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          {...motionProps(0.24)}
          className="mt-14 border-t border-border/80 pt-8"
        >
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-muted">
              © 2026 Cotizador Premium. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted">
              Desarrollado por{" "}
              <a
                href={LANDING_FOOTER_SMARTPRO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded"
              >
                SmartPro
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
