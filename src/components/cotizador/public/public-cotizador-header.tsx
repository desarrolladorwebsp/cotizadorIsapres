"use client";

import { useUfValue } from "@/hooks/use-uf-value";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export function PublicCotizadorHeader() {
  const { ufToClp, loading, isFallback } = useUfValue();

  const ufFormatted = ufToClp.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  return (
    <header
      className={joinClasses(
        "sticky top-0 z-30 border-b bg-white shadow-sm",
        ui.border,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <a
          href="https://isaprespremium.cl/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-white">
            IP
          </div>
          <span className="truncate text-base font-bold text-primary-dark">
            Isapres Premium
          </span>
        </a>

        <div className="ml-auto flex items-center gap-3 text-xs sm:text-sm">
          <span
            className={joinClasses(
              "hidden items-center gap-1.5 font-semibold sm:inline-flex",
              loading ? "text-muted/70" : "text-muted",
            )}
            title={
              isFallback
                ? "Valor de respaldo — no se pudo obtener la UF en línea"
                : "UF del día (actualización automática)"
            }
          >
            UF {loading ? "…" : ufFormatted}
            {!loading && !isFallback ? (
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            ) : null}
          </span>
          <a
            href="tel:+56964133848"
            className={joinClasses(
              "rounded-full px-4 py-2 text-xs font-bold sm:text-sm",
              ui.cta,
            )}
          >
            Contacto
          </a>
        </div>
      </div>
    </header>
  );
}
