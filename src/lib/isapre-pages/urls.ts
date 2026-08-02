import {
  PREMIUM_COTIZADOR_PATH,
  resolveEngineAppBaseUrl,
} from "@/lib/platform/routing";
import { PLATFORM_AGENT_KEY } from "@/lib/partner-entity/platform-agent";

function buildEngineCotizadorUrl(params: Record<string, string>): string {
  const url = new URL(
    PREMIUM_COTIZADOR_PATH,
    `${resolveEngineAppBaseUrl().replace(/\/$/, "")}/`,
  );
  url.searchParams.set("agent", PLATFORM_AGENT_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildIsapreCotizadorUrl(isapreId: string): string {
  return buildEngineCotizadorUrl({ isapres: isapreId });
}

export function buildIsaprePlanCotizadorUrl(
  isapreId: string,
  planCode: string,
): string {
  return buildEngineCotizadorUrl({
    isapres: isapreId,
    plan: planCode,
    auto: "1",
  });
}

export function buildIsapresIndexUrl(): string {
  return "/#isapres";
}

export function buildIsaprePagePath(isapreId: string): string {
  // Las fichas /isapres/* viven en el motor (redirect desde esta landing).
  return `${resolveEngineAppBaseUrl()}/isapres/${isapreId}`;
}

/** URL absoluta al motor con agent Cotizador Premium. */
export function buildPremiumCotizadorPath(): string {
  return `${resolveEngineAppBaseUrl()}${PREMIUM_COTIZADOR_PATH}?agent=${PLATFORM_AGENT_KEY}`;
}
