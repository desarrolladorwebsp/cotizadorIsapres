"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { landing } from "./landing-tokens";
import { LandingLogo } from "./landing-logo";
import {
  LANDING_FOOTER_CONTACT,
  LANDING_FOOTER_DESCRIPTION,
  LANDING_FOOTER_NAV,
  LANDING_FOOTER_SMARTPRO_LABEL,
  LANDING_FOOTER_SMARTPRO_LOGO,
  LANDING_FOOTER_SMARTPRO_URL,
  LANDING_FOOTER_SOCIAL,
} from "./landing-social-data";
import { LandingSocialNetworkIcon } from "./landing-social-icons";

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

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
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
  const isWhatsApp = id === "whatsapp";

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
      className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        isWhatsApp
          ? "border-[#25D366]/30 bg-[#25D366] text-white hover:brightness-105"
          : "border-border/80 bg-background/80 text-muted hover:border-primary/30 hover:bg-secondary-muted hover:text-primary"
      }`}
    >
      <LandingSocialNetworkIcon id={id} className="h-[18px] w-[18px]" />
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
                  href={LANDING_FOOTER_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={reducedMotion ? undefined : { x: 4 }}
                  className="group flex items-start gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-border/80 hover:bg-secondary-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C7E]">
                    <LandingSocialNetworkIcon id="whatsapp" className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-muted">WhatsApp</span>
                    <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {LANDING_FOOTER_CONTACT.whatsapp}
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
            <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted sm:justify-end">
              <span>Desarrollado por</span>
              <a
                href={LANDING_FOOTER_SMARTPRO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={LANDING_FOOTER_SMARTPRO_LABEL}
                title={LANDING_FOOTER_SMARTPRO_LABEL}
                className="inline-flex items-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Image
                  src={LANDING_FOOTER_SMARTPRO_LOGO}
                  alt={LANDING_FOOTER_SMARTPRO_LABEL}
                  width={140}
                  height={40}
                  className="h-8 w-auto object-contain sm:h-9"
                />
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
