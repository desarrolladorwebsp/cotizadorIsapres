"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface UserMenuProps {
  realm: "admin" | "executive";
  fullName: string;
  subtitle: string;
  loginPath: string;
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function UserMenu({
  realm,
  fullName,
  subtitle,
  loginPath,
}: UserMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await fetch(`/api/auth/${realm}/logout`, { method: "POST" });
      router.replace(loginPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [loginPath, realm, router]);

  return (
    <div className="ml-auto flex items-center gap-2 sm:gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium tracking-tight text-foreground">
          {fullName}
        </p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>

      <div
        className={joinClasses(
          touchTarget,
          "rounded-full text-xs font-semibold text-muted md:size-10",
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
          "rounded-lg px-3 py-2 text-xs font-semibold text-muted transition",
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
