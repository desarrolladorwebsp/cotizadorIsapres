"use client";

import { useEffect, useState } from "react";
import type {
  AdminSessionUser,
  ExecutiveSessionUser,
  StaffMeResponse,
} from "@/lib/auth/types";

export function useStaffSession() {
  const [data, setData] = useState<StaffMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok) {
          if (!cancelled) {
            setData(null);
            setError(null);
          }
          return;
        }

        const payload = (await response.json()) as StaffMeResponse;

        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setError("No se pudo validar la sesión.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    session: data,
    user: data?.user ?? null,
    realm: data?.realm ?? null,
    isAdmin: data?.capabilities.adminPanel ?? false,
    /** Puede acceder al panel ejecutivo (admin o ejecutivo). */
    isExecutive: data?.capabilities.executivePanel ?? false,
    /** Solo cuentas ejecutivas con perfil pendiente deben completar onboarding. */
    needsExecutiveOnboarding:
      data?.realm === "executive" &&
      data.user != null &&
      !(data.user as ExecutiveSessionUser).onboardingCompleted,
    loading,
    error,
  };
}

type AuthRealm = "admin" | "executive";

type SessionUserMap = {
  admin: AdminSessionUser | null;
  executive: ExecutiveSessionUser | null;
};

/**
 * Compatibilidad con componentes existentes.
 * Usa la sesión unificada y filtra según el realm solicitado.
 */
export function useAuthSession<T extends AuthRealm>(realm: T) {
  const staff = useStaffSession();

  if (staff.loading || !staff.session) {
    return {
      user: null as SessionUserMap[T] | null,
      loading: staff.loading,
      error: staff.error,
    };
  }

  if (realm === "admin") {
    return {
      user:
        staff.realm === "admin"
          ? (staff.user as SessionUserMap[T])
          : null,
      loading: false,
      error: null,
    };
  }

  return {
    user: staff.user as SessionUserMap[T] | null,
    loading: false,
    error: null,
  };
}
