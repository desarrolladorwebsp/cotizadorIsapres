import { DEFAULT_UF_VALUE_CLP } from "@/lib/economic-indicators";

export interface UfIndicator {
  value: number;
  date: string | null;
  fetchedAt: string;
  fallback?: boolean;
}

interface MindicadorUfResponse {
  serie?: { fecha: string; valor: number }[];
}

const UF_SOURCE_URL = "https://mindicador.cl/api/uf";
const UF_REVALIDATE_SECONDS = 3600;

export async function fetchUfIndicator(): Promise<UfIndicator> {
  const response = await fetch(UF_SOURCE_URL, {
    next: { revalidate: UF_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`UF source responded with ${response.status}`);
  }

  const data = (await response.json()) as MindicadorUfResponse;
  const latest = data.serie?.[0];

  if (!latest?.valor || !Number.isFinite(latest.valor)) {
    throw new Error("UF source returned an invalid value");
  }

  return {
    value: Math.round(latest.valor),
    date: latest.fecha ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export function buildFallbackUfIndicator(): UfIndicator {
  return {
    value: DEFAULT_UF_VALUE_CLP,
    date: null,
    fetchedAt: new Date().toISOString(),
    fallback: true,
  };
}
