"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import {
  ExecutiveMenuIcon,
  ExecutiveMobileNavDrawer,
} from "@/components/executive/executive-mobile-nav-drawer";
import { LandingLogo } from "@/components/platform/landing/landing-logo";
import { useStaffSession } from "@/hooks/use-auth-session";
import {
  STAFF_ADMIN_SECTIONS,
  STAFF_BASE_SECTIONS,
  type StaffSection,
} from "@/lib/staff/staff-sections";
import {
  appShellRoot,
  appShellScroll,
  horizontalScrollRail,
  safeWidth,
  touchTarget,
  ui,
} from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export type ExecutiveSection = StaffSection;

const SECTION_LABELS: Record<
  StaffSection,
  { label: string; shortLabel: string; adminOnly?: boolean }
> = {
  inicio: { label: "Inicio", shortLabel: "Inicio" },
  cotizador: { label: "Cotizador", shortLabel: "Cotiz." },
  clientes: { label: "Clientes", shortLabel: "Clientes" },
  cotizaciones: { label: "Cotizaciones", shortLabel: "Leads" },
  mapa: { label: "Mapa clínicas", shortLabel: "Mapa" },
  prospectos: {
    label: "Prospectos",
    shortLabel: "Prospectos",
    adminOnly: true,
  },
  usuarios: { label: "Usuarios", shortLabel: "Usuarios", adminOnly: true },
  clinicas: { label: "Clínicas", shortLabel: "Clínicas", adminOnly: true },
  ges: { label: "GES", shortLabel: "GES", adminOnly: true },
  "reportes-pdf": {
    label: "PDFs Isapre",
    shortLabel: "PDFs",
    adminOnly: true,
  },
};

export interface ExecutiveShellProps {
  activeSection: ExecutiveSection;
  onSectionChange: (section: ExecutiveSection) => void;
  hasAdminAccess?: boolean;
  children: React.ReactNode;
}

export function ExecutiveShell({
  activeSection,
  onSectionChange,
  hasAdminAccess = false,
  children,
}: ExecutiveShellProps) {
  const { user: staffUser, isAdmin } = useStaffSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isFullBleed = activeSection === "cotizador";
  const showAdminAccess = hasAdminAccess || isAdmin;

  const navSections: StaffSection[] = showAdminAccess
    ? [...STAFF_BASE_SECTIONS, ...STAFF_ADMIN_SECTIONS]
    : STAFF_BASE_SECTIONS;

  const navItems = navSections.map((id) => ({
    id,
    ...SECTION_LABELS[id],
  }));

  const panelTitle = showAdminAccess ? "Panel comercial" : "Panel del ejecutivo";
  const panelSubtitle = showAdminAccess
    ? "Gestión y ventas"
    : "Herramientas comerciales";

  const activeSectionLabel = useMemo(
    () => navItems.find((item) => item.id === activeSection)?.label ?? "Inicio",
    [activeSection, navItems],
  );

  return (
    <div className={joinClasses(appShellRoot, ui.canvas, "min-h-screen")}>
      <header
        className={joinClasses(
          "sticky top-0 z-30 shrink-0 border-b bg-white shadow-sm",
          ui.border,
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className={joinClasses(
              "inline-flex shrink-0 rounded-xl text-muted transition lg:hidden",
              touchTarget,
              ui.borderHairline,
              ui.hoverSurface,
            )}
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileNavOpen}
          >
            <ExecutiveMenuIcon />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <LandingLogo size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-primary-dark sm:text-base">
                {panelTitle}
              </p>
              <p className="truncate text-[11px] text-muted sm:text-xs lg:hidden">
                {activeSectionLabel}
              </p>
              <p className="hidden truncate text-xs text-muted lg:block">
                Cotizador Premium · {panelSubtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/"
              className={joinClasses(
                "hidden rounded-lg px-3 text-sm font-semibold sm:inline-flex sm:px-4",
                touchTarget,
                ui.ctaOutline,
              )}
            >
              <span className="hidden md:inline">Cotizador público</span>
              <span className="md:hidden">Público</span>
            </Link>

            {staffUser ? (
              <UserMenu
                fullName={staffUser.fullName}
                subtitle={isAdmin ? "Administrador" : "Ejecutivo comercial"}
                compact
              />
            ) : null}
          </div>
        </div>

        <nav
          className={joinClasses(
            "premium-executive-tabs hidden border-t bg-white px-4 sm:px-6 lg:block lg:px-8",
            ui.border,
          )}
          aria-label="Secciones del panel"
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
                    touchTarget,
                    isActive
                      ? joinClasses(
                          "premium-executive-tab-active bg-primary text-primary-foreground shadow-[0_4px_14px_-6px_var(--primary)]",
                        )
                      : "text-muted hover:bg-primary/5 hover:text-primary-dark",
                    item.adminOnly ? "border border-transparent" : "",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <ExecutiveMobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navItems={navItems}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        panelTitle={panelTitle}
      />

      {isFullBleed ? (
        <div
          className={joinClasses(
            appShellScroll,
            safeWidth,
            "flex min-h-0 flex-1 flex-col",
          )}
        >
          {children}
        </div>
      ) : (
        <main
          className={joinClasses(
            appShellScroll,
            safeWidth,
            "mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8",
          )}
        >
          {children}
        </main>
      )}
    </div>
  );
}
