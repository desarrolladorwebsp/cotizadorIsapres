"use client";

import { useEffect, useState } from "react";
import { joinClasses } from "@/lib/utils";
import { ui } from "@/lib/ui-tokens";

export interface PublicCotizadorNoticeProps {
  message: string | null;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export function PublicCotizadorNotice({
  message,
  onDismiss,
  autoHideMs = 6000,
}: PublicCotizadorNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoHideMs);

    return () => window.clearTimeout(timer);
  }, [message, autoHideMs, onDismiss]);

  if (!message || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 sm:bottom-8"
      role="status"
      aria-live="polite"
    >
      <div
        className={joinClasses(
          "motion-safe-fade-in max-w-md rounded-2xl border bg-white/95 px-4 py-3 text-center text-sm font-medium text-primary-dark shadow-lg backdrop-blur-sm",
          ui.border,
        )}
      >
        {message}
      </div>
    </div>
  );
}
