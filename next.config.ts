import type { NextConfig } from "next";

/** Orígenes permitidos para iframe embebido (CSP frame-ancestors). */
const embedFrameAncestors =
  process.env.EMBED_FRAME_ANCESTORS?.trim() || "*";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    const frameAncestors = `frame-ancestors ${embedFrameAncestors}`;
    return [
      {
        source: "/cotizador",
        headers: [
          {
            key: "Content-Security-Policy",
            value: frameAncestors,
          },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: frameAncestors,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
