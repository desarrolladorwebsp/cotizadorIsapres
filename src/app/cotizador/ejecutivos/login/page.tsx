import { Suspense } from "react";
import ExecutiveLoginClient from "./login-client";

export default function ExecutiveLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-layout text-sm text-muted">
          Cargando...
        </div>
      }
    >
      <ExecutiveLoginClient />
    </Suspense>
  );
}
