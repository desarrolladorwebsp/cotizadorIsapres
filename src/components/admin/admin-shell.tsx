"use client";

import Link from "next/link";
import {
  appShellRoot,
  appShellScroll,
  horizontalScrollRail,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type AdminSection = "plans" | "clinics";

export interface AdminShellProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  children: React.ReactNode;
}

const navItems: { id: AdminSection; label: string; shortLabel: string }[] = [
  { id: "plans", label: "Planes de salud", shortLabel: "Planes" },
  { id: "clinics", label: "Clínicas y prestadores", shortLabel: "Clínicas" },
];

export function AdminShell({
  activeSection,
  onSectionChange,
  children,
}: AdminShellProps) {
  return (
    <div className={joinClasses(appShellRoot, ui.canvas)}>
      <header
        className={joinClasses(
          "z-30 shrink-0 border-b bg-white shadow-sm lg:sticky lg:top-0",
          ui.border,
        )}
      >
        <div className="mx-auto flex h-14 min-h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary-dark sm:text-base">
                Panel administrativo
              </p>
              <p className="truncate text-xs text-muted">
                Gestión de planes y clínicas
              </p>
            </div>
          </div>

          <Link
            href="/cotizador"
            className={joinClasses(
              "hidden rounded-lg px-4 text-sm font-semibold sm:inline-flex",
              touchTarget,
              ui.ctaOutline,
            )}
          >
            Ir al cotizador
          </Link>
        </div>

        <nav
          className={joinClasses(
            "border-t bg-white px-4 sm:px-6 lg:px-8",
            ui.border,
          )}
          aria-label="Secciones administrativas"
        >
          <div
            className={joinClasses(
              horizontalScrollRail,
              "mx-auto flex max-w-7xl gap-1 py-2",
            )}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSectionChange(item.id)}
                  className={joinClasses(
                    "shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : joinClasses("text-muted", ui.hoverSurface),
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main
        className={joinClasses(
          appShellScroll,
          safeWidth,
          "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        )}
      >
        {children}
      </main>

      <div className="shrink-0 border-t bg-white p-3 sm:hidden">
        <Link
          href="/cotizador"
          className={joinClasses(
            "flex w-full items-center justify-center rounded-lg text-sm font-semibold",
            touchTarget,
            ui.ctaOutline,
          )}
        >
          Volver al cotizador
        </Link>
      </div>
    </div>
  );
}
