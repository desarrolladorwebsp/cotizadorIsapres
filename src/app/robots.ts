import type { MetadataRoute } from "next";
import { resolveAppBaseUrl } from "@/lib/platform/routing";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveAppBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/cotizador"],
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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
