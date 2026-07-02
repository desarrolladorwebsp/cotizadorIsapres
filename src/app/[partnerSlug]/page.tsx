import { notFound } from "next/navigation";
import { PublicCotizadorView } from "@/components/cotizador";
import { loadPartnerEntityPage } from "@/lib/partner-entity/server";
import { isEmbedSearchParam } from "@/lib/embed/is-embed-request";
import {
  isReservedRootSegment,
  isValidPartnerSlugSegment,
} from "@/lib/partner-entity/store";

interface PartnerCotizadorPageProps {
  params: Promise<{ partnerSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PartnerCotizadorPage({
  params,
  searchParams,
}: PartnerCotizadorPageProps) {
  const { partnerSlug } = await params;
  const query = await searchParams;
  const decodedSlug = decodeURIComponent(partnerSlug).trim().toLowerCase();

  if (isReservedRootSegment(decodedSlug) || !isValidPartnerSlugSegment(decodedSlug)) {
    notFound();
  }

  const entity = await loadPartnerEntityPage(decodedSlug);

  if (!entity) {
    notFound();
  }

  return (
    <PublicCotizadorView
      entity={entity}
      embedMode={isEmbedSearchParam(query.embed)}
    />
  );
}
