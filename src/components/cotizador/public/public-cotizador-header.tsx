"use client";

import Image from "next/image";
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
        "sticky top-0 z-30 shrink-0 border-b bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:sticky",
        ui.border,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl min-w-0 items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <a
          href="https://isaprespremium.cl/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 shrink items-center rounded-lg transition hover:opacity-90 focus-visible:outline-offset-4"
        >
          <Image
            src="/images/logo-isapres-premium.png"
            alt="Isapres Premium Cotizador"
            width={220}
            height={52}
            className="h-9 w-auto max-w-[min(100%,14rem)] object-contain object-left sm:h-10 sm:max-w-none"
            priority
          />
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
