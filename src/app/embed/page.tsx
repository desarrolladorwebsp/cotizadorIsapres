import { cookies } from "next/headers";
import { PublicCotizadorView } from "@/components/cotizador";
import { PARTNER_ENTITY_COOKIE } from "@/lib/partner-entity/constants";
import { resolvePartnerEntityForHome } from "@/lib/partner-entity/server";

export default async function EmbedHomePage() {
  const cookieStore = await cookies();
  const cookieSlug = cookieStore.get(PARTNER_ENTITY_COOKIE)?.value;
  const entity = await resolvePartnerEntityForHome(cookieSlug);

  return <PublicCotizadorView entity={entity} embedMode />;
}
