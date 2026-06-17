import { Suspense } from "react";
import AdminLoginClient from "./login-client";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-layout text-sm text-muted">
          Cargando...
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
