import { PLATFORM_AGENT_KEY } from "@/lib/partner-entity/platform-agent";
import {
  PROD_ENGINE_APP_BASE_URL,
  resolveEngineAppBaseUrl,
} from "@/lib/platform/routing";

/** Agente / partner key de Cotizador Premium en la Landing. */
export const LANDING_WIDGET_AGENT_KEY =
  process.env.NEXT_PUBLIC_LANDING_AGENT_KEY?.trim() ||
  process.env.NEXT_PUBLIC_COTIZADOR_AGENT_KEY?.trim() ||
  PLATFORM_AGENT_KEY;

/** Widget JS se sirve desde el motor (isaprespremium.cl). */
export const LANDING_WIDGET_SCRIPT_URL =
  process.env.NEXT_PUBLIC_COTIZADOR_WIDGET_URL?.trim() ||
  `${PROD_ENGINE_APP_BASE_URL}/cotizador-widget.js`;

export const LANDING_WIDGET_MIN_HEIGHT = 720;

function isLocalHostUrl(value: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(value);
}

/**
 * Base URL del cotizador embebido en la landing → motor en isaprespremium.cl.
 */
export function resolveLandingWidgetBaseUrl(): string {
  const configured = resolveEngineAppBaseUrl();
  if (!isLocalHostUrl(configured)) return configured;

  if (typeof window !== "undefined") {
    // En local, el motor suele estar en :3000
    return resolveEngineAppBaseUrl();
  }

  return PROD_ENGINE_APP_BASE_URL;
}
