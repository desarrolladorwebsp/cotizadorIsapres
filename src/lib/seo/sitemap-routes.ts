import { ISAPRE_PAGE_SLUGS } from "@/lib/isapre-pages/content";
import { readActivePartnerSlugs } from "@/lib/partner-entity/store";
import { resolveAppBaseUrl } from "@/lib/platform/routing";
import type { MetadataRoute } from "next";

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = resolveAppBaseUrl();
  const now = new Date();
  const slugs = await readActivePartnerSlugs();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/cotizador`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/index`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  for (const isapreSlug of ISAPRE_PAGE_SLUGS) {
    entries.push({
      url: `${baseUrl}/isapres/${isapreSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  for (const slug of slugs) {
    if (slug === "cotizadorpremium") continue;

    entries.push({
      url: `${baseUrl}/cotizador?agent=${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    });

    entries.push({
      url: `${baseUrl}/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
