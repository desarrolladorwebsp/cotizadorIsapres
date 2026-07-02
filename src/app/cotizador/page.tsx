import { cookies } from "next/headers";
import type { Metadata } from "next";
import { PublicCotizadorView } from "@/components/cotizador";
import {
  AGENT_QUERY_PARAM,
  PARTNER_ENTITY_COOKIE,
  PARTNER_ENTITY_QUERY_PARAM,
} from "@/lib/partner-entity/constants";
import { resolvePartnerEntityForCotizador } from "@/lib/partner-entity/server";
import { isEmbedSearchParam } from "@/lib/embed/is-embed-request";

export const metadata: Metadata = {
  title: "Cotizar plan de salud — Cotizador Premium",
  description:
    "Compara planes Isapre con precios personalizados según tu edad, ingreso y región.",
};

interface CotizadorPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function CotizadorPage({ searchParams }: CotizadorPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieSlug = cookieStore.get(PARTNER_ENTITY_COOKIE)?.value;
  const agentKey =
    readSingleParam(params[AGENT_QUERY_PARAM]) ??
    readSingleParam(params[PARTNER_ENTITY_QUERY_PARAM]);

  const entity = await resolvePartnerEntityForCotizador(agentKey, cookieSlug);
  const embedMode = isEmbedSearchParam(params.embed);

  return <PublicCotizadorView entity={entity} embedMode={embedMode} />;
}
