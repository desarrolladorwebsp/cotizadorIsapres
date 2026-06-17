"use client";

import { useEffect, useState } from "react";
import type { AdminSessionUser, ExecutiveSessionUser } from "@/lib/auth/types";

type AuthRealm = "admin" | "executive";

type SessionUserMap = {
  admin: AdminSessionUser | null;
  executive: ExecutiveSessionUser | null;
};

export function useAuthSession<T extends AuthRealm>(realm: T) {
  const [user, setUser] = useState<SessionUserMap[T] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/auth/${realm}/me`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
            setError(null);
          }
          return;
        }

        const data = (await response.json()) as {
          user: SessionUserMap[T];
        };

        if (!cancelled) {
          setUser(data.user);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
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
  }, [realm]);

  return { user, loading, error };
}
