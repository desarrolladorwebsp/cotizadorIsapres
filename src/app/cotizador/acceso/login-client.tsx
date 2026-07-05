"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { STAFF_DEFAULT_HOME } from "@/lib/auth/constants";

function StaffLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo =
    next && next.startsWith("/cotizador") ? next : STAFF_DEFAULT_HOME;

  return <LoginForm redirectTo={redirectTo} />;
}

export default function StaffLoginPageClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Cargando...
        </div>
      }
    >
      <StaffLoginClient />
    </Suspense>
  );
}
