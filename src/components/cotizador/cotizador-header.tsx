"use client";

import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type CotizadorHeaderVariant = "client" | "executive";

export interface CotizadorHeaderProps {
  variant: CotizadorHeaderVariant;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function CotizadorHeader({
  variant,
  sidebarOpen,
  onToggleSidebar,
}: CotizadorHeaderProps) {
  const isExecutive = variant === "executive";

  return (
    <header
      className={joinClasses(
        "sticky top-0 z-30 shrink-0 border-b bg-white shadow-sm lg:sticky",
        ui.border,
      )}
    >
      <div className="flex h-14 min-h-14 items-center gap-3 px-4 sm:h-[4.5rem] sm:gap-6 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={joinClasses(
            touchTarget,
            "rounded-lg text-muted transition lg:hidden",
            ui.borderHairline,
            ui.hoverSurface,
          )}
          aria-label={sidebarOpen ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            CI
          </div>
          <div className="min-w-0">
            <p
              className={joinClasses(
                "truncate text-sm font-bold tracking-tight sm:text-base",
                ui.sectionTitle,
              )}
            >
              Cotizador Inteligente
            </p>
            <p className="truncate text-xs text-muted">
              {isExecutive
                ? "Herramienta para ejecutivos Isapre"
                : "Cotiza y contrata tu plan de salud"}
            </p>
          </div>
        </div>

        {isExecutive ? (
          <>
            <div className="mx-auto hidden max-w-md flex-1 justify-center md:flex">
              <div
                className={joinClasses(
                  "inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm",
                  ui.borderHairline,
                )}
              >
                <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                <span className="text-muted">Cotización activa</span>
                <span className="font-medium tracking-tight text-foreground">
                  #CI-2406
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium tracking-tight text-foreground">
                  Alfredo Hurtado
                </p>
                <p className="text-xs text-muted">Ejecutivo comercial</p>
              </div>
              <div
                className={joinClasses(
                  touchTarget,
                  "rounded-full text-sm font-medium text-muted md:size-10",
                  ui.borderHairline,
                )}
                aria-hidden
              >
                AH
              </div>
            </div>
          </>
        ) : (
          <div className="ml-auto hidden sm:block">
            <span
              className={joinClasses(
                "inline-flex rounded-full px-4 py-2 text-xs font-semibold",
                "bg-primary/10 text-primary-dark",
              )}
            >
              Autocotización en línea
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
