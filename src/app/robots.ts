import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { PROD_APP_BASE_URL } from "@/lib/platform/routing";
import { isLegacySeoHostname, normalizeHostname } from "@/lib/seo/request-host";

/**
 * robots.txt:
 * - Dominio canónico (cotizadorpremium.cl): indexar + sitemap premium.
 * - Dominio legacy (cotizador.cotizaloantes.cl): noindex total para no
 *   competir en Google con la marca Cotizador Premium.
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
        allow: ["/", "/cotizador", "/inicio", "/isapres"],
        disallow: [
          "/embed",
          "/embed/",
          "/api/",
          "/cotizador/admin",
          "/cotizador/admin/",
          "/cotizador/ejecutivos",
          "/cotizador/ejecutivos/",
          "/cotizador/acceso",
        ],
      },
    ],
    sitemap: `${canonicalBase}/sitemap.xml`,
    host: canonicalBase,
  };
}
