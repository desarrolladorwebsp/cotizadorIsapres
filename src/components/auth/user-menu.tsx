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
      )}
    >
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium tracking-tight text-foreground">
          {fullName}
        </p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>

      <div
        className={joinClasses(
          "rounded-full text-xs font-semibold text-muted",
          compact
            ? "flex size-9 items-center justify-center"
            : joinClasses(touchTarget, "md:size-10"),
          ui.borderHairline,
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
          "rounded-lg font-semibold text-muted transition",
          compact
            ? "px-2.5 py-2 text-[11px]"
            : "px-3 py-2 text-xs",
          ui.borderHairline,
          ui.hoverSurface,
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {loading ? "..." : "Salir"}
      </button>
    </div>
  );
}
