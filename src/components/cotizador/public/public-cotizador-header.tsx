"use client";

import Image from "next/image";
import { useUfValue } from "@/hooks/use-uf-value";
import { usePartnerEntity } from "@/components/partner/partner-entity-provider";
import { publicCotizadorShell, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

function ExitIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 shrink-0"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PublicCotizadorHeader() {
  const { ufToClp, loading, isFallback } = useUfValue();
  const { entity, isBranded } = usePartnerEntity();

  const ufFormatted = ufToClp.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const logoHref = isBranded ? entity!.websiteUrl : "/";
  const logoAlt = isBranded ? entity!.name : "Cotizador Virtual";
  const logoSrc = isBranded
    ? entity!.logoUrl
    : "/images/logo-cotizalo-antes.png";

  return (
    <header
      className={joinClasses(
        "sticky top-0 z-30 shrink-0 border-b bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:sticky",
        ui.border,
      )}
    >
      <div
        className={joinClasses(
          publicCotizadorShell,
          "flex h-14 w-full min-w-0 items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6",
        )}
      >
        <a
          href={logoHref}
          {...(isBranded
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="flex min-w-0 shrink items-center rounded-lg transition hover:opacity-90 focus-visible:outline-offset-4"
        >
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={224}
            height={59}
            className="h-9 w-auto max-w-[min(100%,13rem)] object-contain object-left sm:h-11 sm:max-w-none"
            priority
            unoptimized={logoSrc.startsWith("http")}
          />
        </a>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
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

          {isBranded ? (
            <a
              href={entity!.websiteUrl}
              className={joinClasses(
                touchTarget,
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm",
                ui.ctaOutline,
              )}
            >
              <ExitIcon />
              <span className="hidden sm:inline">{entity!.exitLabel}</span>
              <span className="sm:hidden">Salir</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
