"use client";

import { useCallback, useState } from "react";
import { performStaffLogout } from "@/lib/auth/client-logout";
import { STAFF_LOGIN_PATH } from "@/lib/auth/constants";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface UserMenuProps {
  fullName: string;
  subtitle: string;
  loginPath?: string;
  /** Vista compacta para cabeceras móviles del panel ejecutivo. */
  compact?: boolean;
  /** Texto claro sobre header navy del panel ejecutivo. */
  onDark?: boolean;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserMenu({
  fullName,
  subtitle,
  loginPath = STAFF_LOGIN_PATH,
  compact = false,
  onDark = false,
}: UserMenuProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    await performStaffLogout(loginPath);
  }, [loginPath]);

  return (
    <div
      className={joinClasses(
        "ml-auto flex items-center",
        compact ? "gap-1.5" : "gap-2 sm:gap-3",
        onDark && "premium-executive-user-on-dark",
      )}
    >
      <div className="hidden text-right sm:block">
        <p
          className={joinClasses(
            "premium-user-name text-sm font-semibold tracking-tight",
            onDark ? "" : "text-foreground font-medium",
          )}
        >
          {fullName}
        </p>
        <p
          className={joinClasses(
            "premium-user-subtitle text-xs",
            onDark ? "" : "text-muted",
          )}
        >
          {subtitle}
        </p>
      </div>

      <div
        className={joinClasses(
          "premium-user-avatar rounded-full text-xs font-bold",
          compact
            ? "flex size-9 items-center justify-center"
            : joinClasses(touchTarget, "md:size-10"),
          !onDark && joinClasses("text-muted", ui.borderHairline),
        )}
        aria-hidden
      >
        {getInitials(fullName)}
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={loading}
        className={joinClasses(
          "premium-user-logout font-semibold transition",
          compact ? "px-2.5 py-2 text-[11px]" : "px-3 py-2 text-xs",
          !onDark &&
            joinClasses(
              "rounded-lg text-muted",
              ui.borderHairline,
              ui.hoverSurface,
            ),
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {loading ? "..." : "Salir"}
      </button>
    </div>
  );
}
