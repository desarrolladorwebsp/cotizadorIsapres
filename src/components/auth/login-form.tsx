"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AUTH_REALM,
  STAFF_DEFAULT_HOME,
  STAFF_LOGIN_PATH,
  getChangePasswordPath,
  type AuthRealm,
} from "@/lib/auth/constants";
import { touchTarget, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface LoginFormProps {
  title?: string;
  subtitle?: string;
  redirectTo?: string;
}

function resolveRedirect(
  realm: AuthRealm,
  mustChangePassword: boolean,
  next: string | null,
): string {
  if (mustChangePassword) {
    return getChangePasswordPath(realm);
  }

  if (next && next.startsWith("/cotizador")) {
    return next;
  }

  return STAFF_DEFAULT_HOME;
}

export function LoginForm({
  title = "Acceso al cotizador",
  subtitle = "Ingresa con tu cuenta de administrador o ejecutivo comercial.",
  redirectTo,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as {
        error?: string;
        realm?: AuthRealm;
        user?: { mustChangePassword?: boolean };
      };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo iniciar sesión.");
      }

      const realm = data.realm ?? AUTH_REALM.executive;
      const mustChangePassword = Boolean(data.user?.mustChangePassword);
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;

      router.replace(
        redirectTo ??
          resolveRedirect(realm, mustChangePassword, next),
      );
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-layout px-4 py-10">
      <div
        className={joinClasses(
          ui.surfaceCard,
          "w-full max-w-md p-6 sm:p-8",
        )}
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
            CP
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary-dark">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Correo</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={joinClasses(
                "w-full rounded-lg px-3 py-2.5 text-sm",
                ui.input,
              )}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={joinClasses(
                "w-full rounded-lg px-3 py-2.5 text-sm",
                ui.input,
              )}
            />
          </label>

          {error ? (
            <p
              className="rounded-lg bg-danger-muted px-3 py-2 text-sm text-accent-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={joinClasses(
              touchTarget,
              "w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Una sola cuenta para administradores y ejecutivos. Tu rol se detecta
          automáticamente al ingresar.
        </p>
      </div>
    </div>
  );
}
