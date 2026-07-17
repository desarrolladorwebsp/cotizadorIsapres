import type { NextConfig } from "next";
import { resolveEmbedFrameAncestorsDirective } from "./src/lib/security/embed-frame-ancestors";

/** Orígenes permitidos para iframe embebido (CSP frame-ancestors). */
const embedFrameAncestors = resolveEmbedFrameAncestorsDirective();

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./public/images/logo-cotizador-premium.png"],
  },
  async redirects() {
    return [
      // `/index` en Vercel se normaliza a `/` (→ cotizador). Preferir `/inicio`.
      {
        source: "/index",
        destination: "/inicio",
        permanent: true,
      },
      {
        source: "/index/:path*",
        destination: "/inicio/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/cotizador",
        headers: [
          {
            key: "Content-Security-Policy",
            value: embedFrameAncestors,
          },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: embedFrameAncestors,
          },
        ],
      },
      {
        source: "/cotizador-widget.js",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=300",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
