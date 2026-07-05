"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  EXECUTIVE_HOME_PATH,
  EXECUTIVE_ONBOARDING_PATH,
  STAFF_LOGIN_PATH,
} from "@/lib/auth/constants";
import { useStaffSession } from "@/hooks/use-auth-session";

interface ExecutiveAuthGateProps {
  children: ReactNode;
  /** Ruta protegida; se usa como `next` al redirigir al login. */
  returnPath?: string;
}

export function ExecutiveAuthGate({
  children,
  returnPath = EXECUTIVE_HOME_PATH,
}: ExecutiveAuthGateProps) {
  const router = useRouter();
  const { user, loading, isExecutive, needsExecutiveOnboarding } = useStaffSession();

  useEffect(() => {
    if (loading) return;

    if (!user || !isExecutive) {
      const loginUrl = `${STAFF_LOGIN_PATH}?next=${encodeURIComponent(returnPath)}`;
      router.replace(loginUrl);
      return;
    }

    if (needsExecutiveOnboarding) {
      router.replace(EXECUTIVE_ONBOARDING_PATH);
    }
  }, [loading, user, isExecutive, needsExecutiveOnboarding, router, returnPath]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--muted)]">
        Validando sesión…
      </div>
    );
  }

  if (!user || !isExecutive || needsExecutiveOnboarding) {
    return null;
  }

  return <>{children}</>;
}
