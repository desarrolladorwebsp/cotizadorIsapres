"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useId, useState, type FormEvent } from "react";
import {
  ASESORIA_STEPS,
  CARGAS_MEDICAS_OPTIONS,
  CONTACTO_OPTIONS,
  formatRutInput,
  INITIAL_ASESORIA_FORM,
  MOTIVO_OPTIONS,
  PREVISION_OPTIONS,
  REGIONES_CHILE,
  validateAsesoriaStep,
  type AsesoriaFieldErrors,
  type AsesoriaFormData,
} from "./landing-asesoria-form-data";
import { LandingSectionBackdrop } from "./landing-section-backdrop";
import {
  LANDING_SECTION_BACKGROUND_ALTS,
  LANDING_SECTION_BACKGROUNDS,
} from "./landing-visual-config";
import { landing } from "./landing-tokens";

const inputClass =
  "w-full rounded-xl border border-border/80 bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary/40 focus:ring-2 focus:ring-primary/25";
const inputErrorClass =
  "w-full rounded-xl border border-red-400 bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-400/25";
const labelClass = "mb-1.5 block text-sm font-semibold text-foreground";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-1">
      {ASESORIA_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted || isActive ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-primary bg-primary/15 text-primary-dark"
                      : "border-border bg-white text-muted"
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>
              {index < ASESORIA_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
            <span className="mt-2 hidden text-center text-[10px] leading-tight text-muted sm:block">
              {step.shortLabel.split("\n").map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LandingAsesoriaSection() {
  const reducedMotion = useReducedMotion();
  const formId = useId();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AsesoriaFormData>(INITIAL_ASESORIA_FORM);
  const [errors, setErrors] = useState<AsesoriaFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof AsesoriaFormData>(
    key: K,
    value: AsesoriaFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function goNext() {
    const stepErrors = validateAsesoriaStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((prev) => Math.min(prev + 1, 3));
  }

  function goBack() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const stepErrors = validateAsesoriaStep(3, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        registered?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error ||
            "No pudimos enviar tu solicitud. Intenta nuevamente.",
        );
      }

      setSubmitted(true);
      setForm(INITIAL_ASESORIA_FORM);
      setStep(1);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No pudimos enviar tu solicitud. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="asesoria"
      className={`${landing.sectionSurface} landing-section-with-photo relative overflow-hidden`}
      aria-labelledby="landing-asesoria-title"
    >
      <LandingSectionBackdrop
        imageSrc={LANDING_SECTION_BACKGROUNDS.widget}
        imageAlt={LANDING_SECTION_BACKGROUND_ALTS.widget}
        variant="widget"
      />

      <div className={`${landing.container} relative py-16 sm:py-20 lg:py-24`}>
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={reducedMotion ? undefined : sectionVariants}
          initial={reducedMotion ? undefined : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.span
            variants={reducedMotion ? undefined : itemVariants}
            className={landing.badge}
          >
            Asesoría personalizada
          </motion.span>
          <motion.h2
            id="landing-asesoria-title"
            variants={reducedMotion ? undefined : itemVariants}
            className={`${landing.headline} mt-4 text-3xl sm:text-4xl lg:text-[2.75rem]`}
          >
            Solicita asesoría de un experto
          </motion.h2>
          <motion.p
            variants={reducedMotion ? undefined : itemVariants}
            className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed premium-text-secondary sm:text-lg"
          >
            Completa tus datos y un asesor de Cotizador Premium te contactará
            para comparar planes y encontrar la mejor opción para ti y tu
            familia.
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-10 max-w-2xl"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <div className="landing-glass-panel-strong rounded-3xl border border-border/60 p-5 shadow-lg sm:p-8">
            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-2xl text-primary">
                  ✓
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  ¡Solicitud enviada!
                </h3>
                <p className="mt-2 text-sm leading-relaxed premium-text-secondary sm:text-base">
                  Recibimos tus datos. Un asesor te contactará pronto según tu
                  preferencia.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmitError(null);
                  }}
                  className={`${landing.ctaSecondary} mt-6`}
                >
                  Enviar otra solicitud
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <Stepper currentStep={step} />

                {/* Honeypot */}
                <div className="absolute -left-[9999px] opacity-0" aria-hidden>
                  <label htmlFor={`${formId}-website`}>Sitio web</label>
                  <input
                    id={`${formId}-website`}
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </div>

                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-nombre`}
                      >
                        Nombre y apellido *
                      </label>
                      <input
                        id={`${formId}-nombre`}
                        className={
                          errors.nombreCompleto ? inputErrorClass : inputClass
                        }
                        value={form.nombreCompleto}
                        onChange={(e) =>
                          updateField("nombreCompleto", e.target.value)
                        }
                        placeholder="Ej: María Pérez"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.nombreCompleto)}
                      />
                      <FieldError
                        id={`${formId}-nombre-error`}
                        message={errors.nombreCompleto}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-rut`}>
                        RUT
                      </label>
                      <input
                        id={`${formId}-rut`}
                        className={inputClass}
                        value={form.rut}
                        onChange={(e) =>
                          updateField("rut", formatRutInput(e.target.value))
                        }
                        placeholder="12.345.678-9"
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-edad`}>
                        Edad
                      </label>
                      <input
                        id={`${formId}-edad`}
                        type="number"
                        min={18}
                        max={120}
                        className={inputClass}
                        value={form.edad}
                        onChange={(e) => updateField("edad", e.target.value)}
                        placeholder="Ej: 35"
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-correo`}
                      >
                        Email *
                      </label>
                      <input
                        id={`${formId}-correo`}
                        type="email"
                        className={
                          errors.correo ? inputErrorClass : inputClass
                        }
                        value={form.correo}
                        onChange={(e) => updateField("correo", e.target.value)}
                        placeholder="hola@mimail.cl"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.correo)}
                      />
                      <FieldError
                        id={`${formId}-correo-error`}
                        message={errors.correo}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-celular`}
                      >
                        Teléfono *
                      </label>
                      <input
                        id={`${formId}-celular`}
                        type="tel"
                        className={
                          errors.celular ? inputErrorClass : inputClass
                        }
                        value={form.celular}
                        onChange={(e) => updateField("celular", e.target.value)}
                        placeholder="+56 9 1234 5678"
                        autoComplete="tel"
                        aria-invalid={Boolean(errors.celular)}
                      />
                      <FieldError
                        id={`${formId}-celular-error`}
                        message={errors.celular}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-prevision`}
                      >
                        Previsión actual *
                      </label>
                      <select
                        id={`${formId}-prevision`}
                        className={
                          errors.previsionActual ? inputErrorClass : inputClass
                        }
                        value={form.previsionActual}
                        onChange={(e) =>
                          updateField("previsionActual", e.target.value)
                        }
                        aria-invalid={Boolean(errors.previsionActual)}
                      >
                        {PREVISION_OPTIONS.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id={`${formId}-prevision-error`}
                        message={errors.previsionActual}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor={`${formId}-uf`}>
                        UF actuales
                      </label>
                      <input
                        id={`${formId}-uf`}
                        className={inputClass}
                        value={form.ufActual}
                        onChange={(e) =>
                          updateField("ufActual", e.target.value)
                        }
                        placeholder="Ej: 5, 12, 45"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-region`}
                      >
                        Región *
                      </label>
                      <select
                        id={`${formId}-region`}
                        className={
                          errors.regionResidencia
                            ? inputErrorClass
                            : inputClass
                        }
                        value={form.regionResidencia}
                        onChange={(e) =>
                          updateField("regionResidencia", e.target.value)
                        }
                        aria-invalid={Boolean(errors.regionResidencia)}
                      >
                        {REGIONES_CHILE.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id={`${formId}-region-error`}
                        message={errors.regionResidencia}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-cargas`}
                      >
                        Cargas médicas *
                      </label>
                      <select
                        id={`${formId}-cargas`}
                        className={
                          errors.cargas ? inputErrorClass : inputClass
                        }
                        value={form.cargas}
                        onChange={(e) => updateField("cargas", e.target.value)}
                        aria-invalid={Boolean(errors.cargas)}
                      >
                        {CARGAS_MEDICAS_OPTIONS.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id={`${formId}-cargas-error`}
                        message={errors.cargas}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-edad-cargas`}
                      >
                        Edad de las cargas
                      </label>
                      <input
                        id={`${formId}-edad-cargas`}
                        className={inputClass}
                        value={form.edadCargas}
                        onChange={(e) =>
                          updateField("edadCargas", e.target.value)
                        }
                        placeholder="Ej: 5, 12, 45"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-renta`}
                      >
                        Renta imponible aproximada *
                      </label>
                      <input
                        id={`${formId}-renta`}
                        className={
                          errors.rentaImponible ? inputErrorClass : inputClass
                        }
                        value={form.rentaImponible}
                        onChange={(e) =>
                          updateField("rentaImponible", e.target.value)
                        }
                        placeholder="Ej: $1.200.000"
                        aria-invalid={Boolean(errors.rentaImponible)}
                      />
                      <FieldError
                        id={`${formId}-renta-error`}
                        message={errors.rentaImponible}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-4">
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-motivo`}
                      >
                        Motivo de la solicitud
                      </label>
                      <select
                        id={`${formId}-motivo`}
                        className={inputClass}
                        value={form.motivo}
                        onChange={(e) => updateField("motivo", e.target.value)}
                      >
                        {MOTIVO_OPTIONS.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor={`${formId}-preferencia`}
                      >
                        Preferencia de contacto *
                      </label>
                      <select
                        id={`${formId}-preferencia`}
                        className={
                          errors.preferenciaContacto
                            ? inputErrorClass
                            : inputClass
                        }
                        value={form.preferenciaContacto}
                        onChange={(e) =>
                          updateField("preferenciaContacto", e.target.value)
                        }
                        aria-invalid={Boolean(errors.preferenciaContacto)}
                      >
                        {CONTACTO_OPTIONS.map((opt) => (
                          <option key={opt.value || "empty"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <FieldError
                        id={`${formId}-preferencia-error`}
                        message={errors.preferenciaContacto}
                      />
                    </div>
                    <label className="flex items-start gap-3 rounded-xl border border-border/70 bg-white/70 p-3.5 text-sm leading-relaxed text-foreground">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary/30"
                        checked={form.autorizaDatos}
                        onChange={(e) =>
                          updateField("autorizaDatos", e.target.checked)
                        }
                        aria-invalid={Boolean(errors.autorizaDatos)}
                      />
                      <span>
                        Autorizo el tratamiento de mis datos personales conforme
                        a la{" "}
                        <Link
                          href="/politica-privacidad"
                          className="font-semibold text-primary underline-offset-2 hover:underline"
                        >
                          Política de Privacidad
                        </Link>
                        .
                      </span>
                    </label>
                    <FieldError
                      id={`${formId}-auth-error`}
                      message={errors.autorizaDatos}
                    />
                  </div>
                )}

                {submitError ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {submitError}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className={landing.ctaSecondary}
                      disabled={submitting}
                    >
                      Volver
                    </button>
                  ) : (
                    <span />
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className={landing.ctaPrimary}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={landing.ctaPrimary}
                      disabled={submitting}
                    >
                      {submitting ? "Enviando…" : "Solicitar asesoría"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
