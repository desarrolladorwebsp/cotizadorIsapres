"use client";

import Image from "next/image";
import { useUfValue } from "@/hooks/use-uf-value";
import { usePartnerEntity } from "@/components/partner/partner-entity-provider";
import { PLATFORM_AGENT_KEY } from "@/lib/partner-entity/platform-agent";
import { publicCotizadorShell, touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

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

interface PublicCotizadorHeaderProps {
  embedMode?: boolean;
}

export function PublicCotizadorHeader({ embedMode = false }: PublicCotizadorHeaderProps) {
  const { ufToClp, loading, isFallback } = useUfValue();
  const { entity, isBranded } = usePartnerEntity();

  const ufFormatted = ufToClp.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

  const isPlatformAgent = isBranded && entity!.slug === PLATFORM_AGENT_KEY;
  const exitHref = isPlatformAgent ? "/index" : entity!.websiteUrl;
  const exitLabel = isPlatformAgent
    ? "Ver la página inicial"
    : entity!.exitLabel;
  const logoHref = isBranded ? exitHref : "/";
  const logoAlt = isBranded ? entity!.name : "Cotizador Virtual";
  const logoSrc = isBranded
    ? entity!.logoUrl
    : "/images/logo-cotizalo-antes.png";
  const logoOpensExternal = isBranded && isExternalUrl(logoHref);

  const logoImage = (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={224}
      height={59}
      className="h-9 w-auto max-w-[min(100%,13rem)] object-contain object-left sm:h-11 sm:max-w-none"
      priority
      unoptimized={logoSrc.startsWith("http")}
    />
  );

  return (
    <header
      className={joinClasses(
        embedMode
          ? "shrink-0 border-b bg-white/95 shadow-sm"
          : "sticky top-0 z-30 shrink-0 border-b bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:sticky",
        ui.border,
      )}
    >
      <div
        className={joinClasses(
          publicCotizadorShell,
          "flex h-14 w-full min-w-0 items-center gap-3 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6",
        )}
      >
        {embedMode ? (
          <div className="flex min-w-0 shrink items-center">{logoImage}</div>
        ) : (
          <a
            href={logoHref}
            {...(logoOpensExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="flex min-w-0 shrink items-center rounded-lg transition hover:opacity-90 focus-visible:outline-offset-4"
          >
            {logoImage}
          </a>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <span
            className={joinClasses(
              "inline-flex items-center gap-1.5 font-semibold",
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

          {isBranded && !embedMode ? (
            <a
              href={exitHref}
              className={joinClasses(
                touchTarget,
                "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm",
                ui.ctaOutline,
              )}
            >
              <ExitIcon />
              <span className="hidden sm:inline">{exitLabel}</span>
              <span className="sm:hidden">Inicio</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
