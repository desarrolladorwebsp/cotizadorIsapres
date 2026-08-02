import { PROD_APP_BASE_URL, PROD_ENGINE_APP_BASE_URL } from "@/lib/platform/routing";
import type { MetadataRoute } from "next";

/**
 * Sitemap de la landing (cotizadorpremium.cl).
 * El cotizador e isapres canónicos viven en isaprespremium.cl.
 */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const landingBase = PROD_APP_BASE_URL.replace(/\/$/, "");
  const engineBase = PROD_ENGINE_APP_BASE_URL.replace(/\/$/, "");
  const now = new Date();

  return [
    {
      url: `${landingBase}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${landingBase}/politica-privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${engineBase}/cotizador?agent=cotizadorpremium`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
