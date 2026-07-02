"use client";

import { useEffect, useState } from "react";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface PublicCotizadorNoticeProps {
  message: string | null;
  onDismiss?: () => void;
  autoHideMs?: number;
  /** Fuerza re-mostrar el aviso aunque el texto sea el mismo. */
  noticeKey?: number;
  /** Centrado con fondo y color de alerta (widget embebido). */
  prominent?: boolean;
  title?: string;
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-6"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PublicCotizadorNotice({
  message,
  onDismiss,
  autoHideMs = 6000,
  noticeKey = 0,
  prominent = false,
  title = "Completa los datos del cotizador",
}: PublicCotizadorNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (prominent) return;

    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoHideMs);

    return () => window.clearTimeout(timer);
  }, [message, noticeKey, autoHideMs, onDismiss, prominent]);

  function dismiss() {
    setVisible(false);
    onDismiss?.();
  }

  if (!message || !visible) return null;

  if (prominent) {
    return (
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-[2px]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cotizador-notice-title"
        aria-describedby="cotizador-notice-body"
      >
        <div
          className={joinClasses(
            "motion-safe-fade-in pointer-events-auto w-full max-w-md rounded-2xl border-2 border-warning bg-white p-6 text-center shadow-2xl",
            "ring-4 ring-warning/25",
          )}
        >
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-warning text-warning-foreground shadow-md">
            <AlertIcon />
          </div>
          <p
            id="cotizador-notice-title"
            className="text-base font-bold text-foreground"
          >
            {title}
          </p>
          <p
            id="cotizador-notice-body"
            className="mt-2 text-sm leading-relaxed text-foreground/90"
          >
            {message}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className={joinClasses(
              touchTarget,
              "mt-5 w-full rounded-full px-6 text-sm font-bold text-white shadow-md",
              ui.cta,
            )}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 sm:bottom-8"
      role="status"
      aria-live="polite"
    >
      <div
        className={joinClasses(
          "motion-safe-fade-in max-w-md rounded-2xl border border-warning/50 bg-warning-muted px-4 py-3 text-center text-sm font-semibold text-foreground shadow-lg",
        )}
      >
        {message}
      </div>
    </div>
  );
}
