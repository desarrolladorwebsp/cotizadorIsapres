"use client";

import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { ADMIN_CHANGE_PASSWORD_PATH, ADMIN_HOME_PATH } from "@/lib/auth/constants";

export default function AdminLoginClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redirectTo =
    next && next.startsWith(ADMIN_HOME_PATH) ? next : ADMIN_HOME_PATH;

  return (
    <LoginForm
      realm="admin"
      title="Acceso administración"
      subtitle="Ingresa con tu cuenta de administrador."
      redirectTo={redirectTo}
      changePasswordPath={ADMIN_CHANGE_PASSWORD_PATH}
    />
  );
}
