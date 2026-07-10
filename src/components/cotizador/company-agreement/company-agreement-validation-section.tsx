"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CompanyAgreementInfoModal } from "@/components/cotizador/company-agreement/company-agreement-info-modal";
import {
  hasCompanyAgreementInquiryData,
  validateCompanyAgreementFields,
} from "@/lib/email/company-agreement-schema";
import { sanitizeRutInput } from "@/lib/auth/rut";
import { accent, safeWidth, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={joinClasses("size-4", className)}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 10v5M12 8h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={joinClasses(
        "size-4 shrink-0 transition-transform duration-200",
        expanded && "rotate-180",
      )}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path
        d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3zM5 17l.8 2.6L8.4 20l-2.6.8L5 23.4l-.8-2.6L1.6 20l2.6-.8L5 17zM19 14l.6 1.8L21.4 16l-1.8.6L19 18.4l-.6-1.8L16.6 16l1.8-.6L19 14z"
        fill="currentColor"
      />
    </svg>
  );
}

export type CompanyAgreementSource = "public" | "executive" | "embed";
export type CompanyAgreementVariant = "standalone" | "inline";

export interface CompanyAgreementValidationSectionProps {
  compactEmbed?: boolean;
  source?: CompanyAgreementSource;
  partnerEntitySlug?: string;
  className?: string;
  /** Integrado en la tarjeta del buscador principal. */
  variant?: CompanyAgreementVariant;
}

type FieldKey = "userRut" | "email" | "phone" | "companyRut";

const FIELD_LABELS: Record<FieldKey, string> = {
  userRut: "Tu RUT",
  email: "Correo",
  phone: "Teléfono",
  companyRut: "RUT empresa",
};

const FIELD_PLACEHOLDERS: Record<FieldKey, string> = {
  userRut: "12.345.678-9",
  email: "correo@ejemplo.cl",
  phone: "+56 9 1234 5678",
  companyRut: "76.543.210-K",
};

const INLINE_TITLE =
  "¿Tu empresa tiene convenio? Obtén hasta un 10% de descuento";

const inlineFieldClass = joinClasses(
  "h-9 w-full min-w-0 rounded-lg border-0 bg-white px-2.5 text-sm shadow-sm ring-1 ring-border/80 placeholder:text-muted/70 focus:ring-2 focus:ring-primary/40",
);

export function CompanyAgreementValidationSection({
  compactEmbed = false,
  source = "public",
  partnerEntitySlug,
  className,
  variant = "standalone",
}: CompanyAgreementValidationSectionProps) {
  const isInline = variant === "inline";
  const [expanded, setExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [userRut, setUserRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyRut, setCompanyRut] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldKey, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const resolvedSource: CompanyAgreementSource = compactEmbed ? "embed" : source;

  const handleRutChange = useCallback(
    (field: "userRut" | "companyRut", value: string) => {
      const next = sanitizeRutInput(value);
      if (field === "userRut") setUserRut(next);
      else setCompanyRut(next);
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
      setSubmitted(false);
    },
    [],
  );

  const handleFieldChange = useCallback((field: FieldKey, value: string) => {
    if (field === "userRut") setUserRut(value);
    if (field === "email") setEmail(value);
    if (field === "phone") setPhone(value);
    if (field === "companyRut") setCompanyRut(value);
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
    setSubmitted(false);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const values = { userRut, email, phone, companyRut };

    if (!hasCompanyAgreementInquiryData(values)) {
      setSubmitError(
        "Puedes dejar tus datos para que revisemos tu convenio, o continuar cotizando sin completar este formulario.",
      );
      return;
    }

    const errors = validateCompanyAgreementFields(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/company-agreement-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          source: resolvedSource,
          cotizadorUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
          partnerEntitySlug,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error ?? "No pudimos enviar tu consulta. Intenta nuevamente.",
        );
      }

      setSubmitted(true);
      setFieldErrors({});
      if (isInline) setExpanded(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No pudimos enviar tu consulta. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getFieldValue(field: FieldKey): string {
    if (field === "userRut") return userRut;
    if (field === "email") return email;
    if (field === "phone") return phone;
    return companyRut;
  }

  function renderFieldInput(
    field: FieldKey,
    options?: { inline?: boolean; hideLabel?: boolean },
  ) {
    const inline = options?.inline ?? false;
    const hideLabel = options?.hideLabel ?? false;

    return (
      <label
        key={field}
        className={joinClasses(
          "block min-w-0",
          inline ? "space-y-1 lg:space-y-0.5" : "space-y-1.5",
        )}
      >
        {hideLabel ? null : (
          <span
            className={joinClasses(
              "text-xs font-semibold text-foreground/90",
              inline && "lg:sr-only",
              compactEmbed && "max-md:text-[11px]",
            )}
          >
            {FIELD_LABELS[field]}
          </span>
        )}
        <input
          type={field === "email" ? "email" : "text"}
          inputMode={
            field === "phone" ? "tel" : field.includes("Rut") ? "text" : undefined
          }
          autoComplete={
            field === "email"
              ? "email"
              : field === "phone"
                ? "tel"
                : field === "userRut"
                  ? "off"
                  : "organization"
          }
          value={getFieldValue(field)}
          onChange={(event) => {
            const value = event.target.value;
            if (field === "userRut" || field === "companyRut") {
              handleRutChange(field, value);
              return;
            }
            handleFieldChange(field, value);
          }}
          placeholder={FIELD_PLACEHOLDERS[field]}
          className={joinClasses(
            inline
              ? joinClasses(
                  inlineFieldClass,
                  compactEmbed && "max-md:h-8 max-md:text-xs",
                )
              : joinClasses(
                  "h-10 w-full rounded-xl px-3 text-sm",
                  compactEmbed && "max-md:h-9 max-md:rounded-lg max-md:text-xs",
                  ui.input,
                ),
            fieldErrors[field] &&
              "ring-accent-danger/50 focus:ring-accent-danger/40",
          )}
          aria-label={hideLabel ? FIELD_LABELS[field] : undefined}
          aria-invalid={Boolean(fieldErrors[field])}
          aria-describedby={
            fieldErrors[field] ? `company-agreement-${field}-error` : undefined
          }
        />
        {fieldErrors[field] ? (
          <span
            id={`company-agreement-${field}-error`}
            className="text-[10px] text-accent-danger"
          >
            {fieldErrors[field]}
          </span>
        ) : null}
      </label>
    );
  }

  const formContent = submitted ? (
    <div
      className={joinClasses(
        "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900",
        isInline && "mt-2",
        compactEmbed && "max-md:text-xs",
      )}
      role="status"
    >
      <p className="font-semibold">¡Consulta enviada!</p>
      <p className="mt-0.5 text-xs text-emerald-800/90">
        Revisaremos si tu empresa tiene convenio vigente y te contactaremos si
        aplica un beneficio.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-2" noValidate>
      <div
        className={joinClasses(
          isInline
            ? "grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-2"
            : "grid gap-3 sm:grid-cols-2",
          compactEmbed && "max-md:gap-2",
        )}
      >
        {(Object.keys(FIELD_LABELS) as FieldKey[]).map((field) =>
          renderFieldInput(field, { inline: isInline, hideLabel: isInline }),
        )}
        <div
          className={joinClasses(
            isInline
              ? "sm:col-span-2 lg:col-span-1 lg:flex lg:justify-end"
              : "sm:col-span-2 flex justify-end",
          )}
        >
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            className={joinClasses(
              "w-full shrink-0 lg:w-auto lg:min-w-[7.5rem]",
              isInline && "h-9 rounded-lg px-4 text-xs",
              compactEmbed && "max-md:h-8 max-md:px-3 max-md:text-[11px]",
            )}
          >
            {submitting ? "Enviando…" : "Validar convenio"}
          </Button>
        </div>
      </div>

      {!isInline ? (
        <p
          className={joinClasses(
            "text-[11px] leading-relaxed text-muted",
            compactEmbed && "max-md:text-[10px]",
          )}
        >
          Todos los campos son opcionales. Puedes seguir cotizando sin completar
          este formulario.
        </p>
      ) : null}

      {submitError ? (
        <p
          className={joinClasses(
            "rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900 ring-1 ring-amber-200/80",
            compactEmbed && "max-md:text-[10px]",
          )}
          role="status"
        >
          {submitError}
        </p>
      ) : null}
    </form>
  );

  if (isInline) {
    return (
      <>
        <div
          data-embed-measure
          className={joinClasses(
            safeWidth,
            "border-t border-primary/15",
            compactEmbed ? "mt-2.5 pt-2.5" : "mt-3 pt-3",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls="company-agreement-panel"
              className={joinClasses(
                "flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left transition hover:bg-white/40",
                touchTarget,
                "min-h-10 lg:min-h-9",
              )}
            >
              <span
                className={joinClasses(
                  "min-w-0 flex-1 font-semibold leading-snug text-primary-dark",
                  compactEmbed
                    ? "text-xs max-md:text-[11px]"
                    : "text-sm sm:text-[15px]",
                )}
              >
                {INLINE_TITLE}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                {expanded ? "Ocultar" : "Consultar"}
                <ChevronIcon expanded={expanded} />
              </span>
            </button>

            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              aria-label="Más información sobre convenios empresa–Isapre"
              className={joinClasses(
                "inline-flex shrink-0 items-center justify-center rounded-full border text-secondary transition hover:bg-white/60 hover:text-secondary",
                accent.ringSecondary,
                "size-8",
                touchTarget,
              )}
            >
              <InfoIcon className="size-3.5" />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                id="company-agreement-panel"
                key="company-agreement-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className={joinClasses("pt-2", compactEmbed && "pt-1.5")}>
                  {formContent}
                  <p className="mt-1.5 text-[10px] text-muted/90">
                    Campos opcionales. Puedes seguir cotizando sin completarlos.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {submitted && !expanded ? (
            <p className="mt-1.5 text-[11px] font-medium text-emerald-700">
              Consulta enviada. Te contactaremos si hay convenio aplicable.
            </p>
          ) : null}
        </div>

        <CompanyAgreementInfoModal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          embedded={compactEmbed}
        />
      </>
    );
  }

  return (
    <>
      <section
        data-embed-measure
        aria-labelledby="company-agreement-title"
        className={joinClasses(
          safeWidth,
          "rounded-2xl border bg-gradient-to-br from-primary/[0.07] via-white to-secondary/[0.06] shadow-sm",
          accent.borderPrimary,
          compactEmbed ? "p-3 max-md:p-2.5" : "p-4 sm:p-5",
          className,
        )}
      >
        <div
          className={joinClasses(
            "flex items-start gap-3",
            compactEmbed && "max-md:gap-2",
          )}
        >
          <span
            className={joinClasses(
              "inline-flex shrink-0 items-center justify-center rounded-xl text-primary-dark",
              accent.iconPrimary,
              compactEmbed ? "size-9 max-md:size-8" : "size-10",
            )}
            aria-hidden
          >
            <SparkIcon />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                aria-expanded={expanded}
                className="min-w-0 flex-1 text-left"
              >
                <h2
                  id="company-agreement-title"
                  className={joinClasses(
                    "font-bold leading-snug text-primary-dark",
                    compactEmbed
                      ? "text-sm max-md:text-[13px]"
                      : "text-base sm:text-lg",
                  )}
                >
                  {INLINE_TITLE}
                </h2>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  {expanded ? "Ocultar formulario" : "Consultar convenio"}
                  <ChevronIcon expanded={expanded} />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInfoOpen(true)}
                aria-label="Más información sobre convenios empresa–Isapre"
                className={joinClasses(
                  "inline-flex shrink-0 items-center justify-center rounded-full border text-secondary transition hover:bg-secondary/10 hover:text-secondary",
                  accent.ringSecondary,
                  compactEmbed ? "size-8" : "size-9",
                  touchTarget,
                )}
              >
                <InfoIcon />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className={joinClasses("pt-3", compactEmbed && "pt-2")}>
                    {formContent}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {submitted && !expanded ? (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Consulta enviada. Te contactaremos si hay convenio aplicable.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <CompanyAgreementInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        embedded={compactEmbed}
      />
    </>
  );
}
