import { PLATFORM_AGENT_KEY } from "@/lib/partner-entity/platform-agent";

/** Agente / partner key de Cotizador Premium en la Landing. */
export const LANDING_WIDGET_AGENT_KEY =
  process.env.NEXT_PUBLIC_LANDING_AGENT_KEY?.trim() ||
  process.env.NEXT_PUBLIC_COTIZADOR_AGENT_KEY?.trim() ||
  PLATFORM_AGENT_KEY;

export const LANDING_WIDGET_SCRIPT_URL =
  process.env.NEXT_PUBLIC_COTIZADOR_WIDGET_URL?.trim() ||
  "https://cotizador-widget.vercel.app/cotizador-widget.js";

export const LANDING_WIDGET_MIN_HEIGHT = 720;

export function resolveLandingWidgetBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_COTIZADOR_URL?.replace(/\/$/, "");

  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3001";
}
