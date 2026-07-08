"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LANDING_FOOTER_CONTACT } from "@/components/platform/landing/landing-social-data";
import { landing } from "@/components/platform/landing/landing-tokens";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 30, delay },
  }),
};

const PRINCIPLES = [
  { id: "legalidad", label: "Legalidad", description: "Tratamiento conforme a la normativa vigente." },
  { id: "seguridad", label: "Seguridad", description: "Medidas para resguardar tu información." },
  { id: "transparencia", label: "Transparencia", description: "Información clara sobre el uso de datos." },
  { id: "responsabilidad", label: "Responsabilidad", description: "Gestión diligente y trazable." },
] as const;

type PolicySection = {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const POLICY_SECTIONS: PolicySection[] = [
  {
    id: "pp-ambito",
    number: 1,
    title: "Ámbito de aplicación",
    paragraphs: [
      "Esta política aplica al tratamiento de datos personales realizado por Cotizador Premium a través del sitio web cotizadorpremium.cl y sus herramientas asociadas de cotización, contacto y gestión de clientes.",
      "Se entiende por dato personal cualquier información que identifique o pueda identificar a una persona natural, de acuerdo con la Ley N° 21.719.",
    ],
  },
  {
    id: "pp-responsable",
    number: 2,
    title: "Responsable del tratamiento",
    paragraphs: [
      "El responsable del tratamiento de tus datos personales es Cotizador Premium, quien determina las finalidades y medios del tratamiento.",
      `Puedes comunicarte con nosotros a través del correo ${LANDING_FOOTER_CONTACT.email} o mediante nuestro canal oficial de WhatsApp publicado en este sitio.`,
    ],
  },
  {
    id: "pp-datos",
    number: 3,
    title: "Datos que tratamos",
    paragraphs: [
      "Dependiendo de cómo interactúes con el sitio, podemos tratar las siguientes categorías de datos:",
    ],
    bullets: [
      "Datos de contacto: nombre, RUT, correo electrónico, teléfono y comuna o región.",
      "Datos asociados a la cotización: información sobre tu situación previsional, rango de ingresos, preferencia de planes y otras variables necesarias para mostrar opciones de planes de salud.",
      "Datos de uso del sitio: información técnica y analítica recolectada mediante cookies o tecnologías similares, para fines de seguridad y mejora del servicio.",
    ],
  },
  {
    id: "pp-finalidades",
    number: 4,
    title: "Finalidades del tratamiento",
    paragraphs: ["Tratamos tus datos personales únicamente para las siguientes finalidades:"],
    bullets: [
      "Permitir el uso del cotizador y mostrar planes de salud acordes a tu perfil.",
      "Gestionar tus solicitudes de contacto y asesoría personalizada.",
      "Enviar información relacionada con tu cotización, seguimiento comercial y recordatorios asociados.",
      "Cumplir obligaciones legales, regulatorias y de resguardo de información, según la normativa vigente.",
      "Mejorar la seguridad, calidad y experiencia de uso de nuestro sitio, mediante análisis estadístico no individualizado.",
    ],
  },
  {
    id: "pp-base-legal",
    number: 5,
    title: "Base legal y consentimiento",
    paragraphs: [
      "El tratamiento de tus datos se realiza principalmente sobre la base de tu consentimiento, que otorgas al enviarnos voluntariamente tu información en los formularios del sitio o al usar el cotizador.",
      "En otros casos, podremos tratar datos cuando exista una obligación legal aplicable o cuando sea necesario para la ejecución de medidas precontractuales vinculadas a la contratación de un plan de salud.",
    ],
  },
  {
    id: "pp-derechos",
    number: 6,
    title: "Derechos de las personas titulares de datos",
    paragraphs: [
      "De acuerdo con la Ley N° 21.719, como titular de datos personales tienes, entre otros, los siguientes derechos:",
      `Para ejercer estos derechos puedes escribirnos a ${LANDING_FOOTER_CONTACT.email} indicando tu nombre, RUT y el derecho que deseas ejercer. Responderemos dentro de los plazos legales aplicables.`,
    ],
    bullets: [
      "Acceder a tus datos personales y conocer cómo se están tratando.",
      "Solicitar la rectificación o actualización de datos inexactos o incompletos.",
      "Solicitar la eliminación de tus datos cuando ya no sean necesarios o retires tu consentimiento.",
      "Oponerte a determinados tratamientos, en los casos que establece la ley.",
      "Solicitar la portabilidad de tus datos, cuando corresponda.",
    ],
  },
  {
    id: "pp-destinatarios",
    number: 7,
    title: "Comunicaciones y encargados de tratamiento",
    paragraphs: [
      "Tus datos personales podrán ser comunicados a prestadores de servicios que actúen como encargados de tratamiento, tales como proveedores de infraestructura tecnológica, herramientas de envío de correos electrónicos y sistemas de gestión interna, siempre bajo contratos que resguarden la confidencialidad, seguridad y las instrucciones de Cotizador Premium.",
      "Podremos compartir información con aseguradoras o instituciones de salud previsional solo cuando sea necesario para gestionar tu cotización o contratación y conforme a tu consentimiento.",
    ],
  },
  {
    id: "pp-conservacion",
    number: 8,
    title: "Plazo de conservación",
    paragraphs: [
      "Conservaremos tus datos personales únicamente durante el tiempo necesario para cumplir las finalidades descritas en esta política y los plazos que exija la normativa aplicable (por ejemplo, deberes de información, respaldo comercial o contable).",
      "Una vez vencidos dichos plazos, tus datos serán eliminados, anonimizados o bloqueados de forma segura.",
    ],
  },
  {
    id: "pp-seguridad",
    number: 9,
    title: "Medidas de seguridad",
    paragraphs: [
      "Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales frente a accesos no autorizados, pérdida, alteración o divulgación indebida, en línea con los principios de seguridad y responsabilidad establecidos por la Ley N° 21.719.",
    ],
  },
  {
    id: "pp-actualizaciones",
    number: 10,
    title: "Actualizaciones de esta política",
    paragraphs: [
      "Podremos actualizar esta política para reflejar cambios normativos, operativos o en los servicios ofrecidos. Cuando exista una modificación relevante, lo informaremos por los canales habituales del sitio.",
      "Te recomendamos revisar periódicamente esta página para mantenerte informado sobre cómo protegemos tus datos personales.",
    ],
  },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionIcon({ number }: { number: number }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
      {number}
    </span>
  );
}

export function PoliticaPrivacidadView() {
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
    <div className="relative overflow-hidden">
      <section className="relative border-b border-border/60">
        <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-25" aria-hidden />
        <div className={`${landing.container} relative py-12 sm:py-16 lg:py-20`}>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary-hover"
            >
              <span aria-hidden>‹</span>
              Volver al inicio
            </Link>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-3xl"
          >
            <p className={landing.badge}>
              <ShieldIcon className="h-4 w-4" />
              Ley N° 21.719 · Protección de datos personales
            </p>
            <h1 className={`${landing.headline} mt-6 text-3xl sm:text-4xl lg:text-5xl`}>
              Política de Privacidad y Protección de Datos Personales
            </h1>
            <p className={`${landing.subheadline} mt-5 text-base sm:text-lg`}>
              En Cotizador Premium nos comprometemos a proteger tus datos personales y a tratarlos
              conforme a la Ley chilena N° 21.719, resguardando tu privacidad y tus derechos.
            </p>
          </motion.div>

          <motion.div
            {...motionProps(0.16)}
            className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PRINCIPLES.map((principle) => (
              <div
                key={principle.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <p className="text-sm font-bold text-primary">{principle.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                  {principle.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={`${landing.sectionSurface} border-b border-border/60 py-10 sm:py-12`}>
        <div className={landing.container}>
          <motion.div {...motionProps(0)} className="max-w-3xl">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Marco normativo
            </h2>
            <p className="mt-3 text-sm leading-relaxed premium-text-secondary sm:text-base">
              La Ley N° 21.719 regula cómo se recolectan, usan, almacenan y comparten los datos
              personales, con el objetivo de proteger la privacidad y los derechos de las personas.
              Cotizador Premium implementa esta política como parte de su compromiso con el
              cumplimiento normativo y la transparencia.
            </p>
          </motion.div>

          <motion.nav
            {...motionProps(0.08)}
            aria-label="Índice de la política"
            className="mt-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Contenido
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {POLICY_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm transition-all hover:border-primary/30 hover:bg-secondary-muted/60 hover:shadow-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      {section.number}
                    </span>
                    <span className="font-medium text-foreground">{section.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </div>
      </section>

      <section className="py-10 sm:py-14 lg:py-16">
        <div className={`${landing.container} space-y-5 sm:space-y-6`}>
          {POLICY_SECTIONS.map((section, index) => (
            <motion.article
              key={section.id}
              id={section.id}
              {...motionProps(index * 0.04)}
              className="scroll-mt-28 rounded-2xl border border-border/70 bg-background/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-md sm:p-6 lg:p-7"
            >
              <div className="flex items-start gap-4">
                <SectionIcon number={section.number} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {section.number}. {section.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-relaxed premium-text-secondary sm:text-[15px]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="space-y-2 pl-1">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2.5">
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden
                            />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={`${landing.sectionSurface} border-t border-border/60 py-10 sm:py-14`}>
        <div className={landing.container}>
          <motion.div
            {...motionProps(0)}
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary-muted/40 p-6 sm:p-8 lg:p-10"
          >
            <div className="landing-grid-pattern pointer-events-none absolute inset-0 opacity-20" aria-hidden />
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                ¿Tienes dudas?
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Ejerce tus derechos o contáctanos
              </h2>
              <p className="mt-3 text-sm leading-relaxed premium-text-secondary sm:text-base">
                Si deseas acceder, rectificar o eliminar tus datos personales, escríbenos y
                responderemos conforme a los plazos de la Ley N° 21.719.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`mailto:${LANDING_FOOTER_CONTACT.email}`}
                  className={landing.ctaPrimary}
                >
                  {LANDING_FOOTER_CONTACT.email}
                </a>
                <a
                  href={LANDING_FOOTER_CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={landing.ctaSecondary}
                >
                  WhatsApp {LANDING_FOOTER_CONTACT.whatsapp}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
