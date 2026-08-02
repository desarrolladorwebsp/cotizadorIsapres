import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PROD_APP_BASE_URL } from "@/lib/platform/routing";
import { isLegacySeoHostname, normalizeHostname } from "@/lib/seo/request-host";

/**
 * robots.txt (landing cotizadorpremium.cl):
 * - Indexar solo marketing local.
 * - El motor (/cotizador, paneles) vive en isaprespremium.cl.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = normalizeHostname(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
  );
  const canonicalBase = PROD_APP_BASE_URL.replace(/\/$/, "");

  if (isLegacySeoHostname(host)) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
      host: canonicalBase,
      sitemap: `${canonicalBase}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/politica-privacidad"],
        disallow: [
          "/cotizador",
          "/cotizador/",
          "/embed",
          "/embed/",
          "/api/",
          "/isapres",
          "/isapres/",
        ],
      },
    ],
    sitemap: `${canonicalBase}/sitemap.xml`,
    host: canonicalBase,
  };
}
