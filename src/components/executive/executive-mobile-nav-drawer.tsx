"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import type { StaffSection } from "@/lib/staff/staff-sections";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface ExecutiveNavItem {
  id: StaffSection;
  label: string;
  shortLabel: string;
  adminOnly?: boolean;
}

export interface ExecutiveMobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: ExecutiveNavItem[];
  activeSection: StaffSection;
  onSectionChange: (section: StaffSection) => void;
  panelTitle: string;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path
        d="M8 8l8 8M16 8l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ExecutiveMobileNavDrawer({
  open,
  onClose,
  navItems,
  activeSection,
  onSectionChange,
  panelTitle,
}: ExecutiveMobileNavDrawerProps) {
  useScrollLock(open);

  const handleSelect = (section: StaffSection) => {
    onSectionChange(section);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="executive-nav-backdrop"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Cerrar menú de navegación"
            className="fixed inset-0 z-40 bg-primary-dark/25 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className={joinClasses(
          "premium-executive-mobile-nav fixed inset-y-0 left-0 z-50 flex w-[min(100%,18.5rem)] flex-col border-r bg-white shadow-xl lg:hidden",
          ui.border,
          !open && "pointer-events-none",
        )}
      >
        <div
          className={joinClasses(
            "flex shrink-0 items-center justify-between border-b px-4 py-3.5",
            ui.border,
          )}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Navegación
            </p>
            <p className="truncate text-sm font-bold text-primary-dark">
              {panelTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={joinClasses(
              "inline-flex rounded-lg text-muted transition",
              touchTarget,
              ui.hoverSurface,
            )}
            aria-label="Cerrar menú"
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3"
          aria-label="Secciones del panel"
        >
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={joinClasses(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition",
                      touchTarget,
                      isActive
                        ? joinClasses(
                            "premium-executive-tab-active bg-primary text-primary-foreground shadow-[0_4px_14px_-6px_var(--primary)]",
                          )
                        : "text-foreground hover:bg-primary/5 hover:text-primary-dark",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {item.adminOnly ? (
                      <span
                        className={joinClasses(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          isActive
                            ? "bg-white/20 text-primary-foreground"
                            : "bg-primary/8 text-primary",
                        )}
                      >
                        Admin
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className={joinClasses(
            "shrink-0 border-t px-4 py-4",
            ui.border,
          )}
        >
          <Link
            href="/"
            onClick={onClose}
            className={joinClasses(
              "flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold",
              touchTarget,
              ui.ctaOutline,
            )}
          >
            Cotizador público
          </Link>
        </div>
      </motion.aside>
    </>
  );
}

export function ExecutiveMenuIcon() {
  return (
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
  );
}
