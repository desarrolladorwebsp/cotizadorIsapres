"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { EXECUTIVE_HOME_PATH } from "@/lib/auth/constants";

export default function ExecutiveLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo =
    next && next.startsWith(EXECUTIVE_HOME_PATH) ? next : EXECUTIVE_HOME_PATH;

  return (
    <LoginForm
      realm="executive"
      title="Acceso ejecutivos"
      subtitle="Ingresa con tu cuenta de ejecutivo comercial."
      redirectTo={redirectTo}
    />
  );
}
