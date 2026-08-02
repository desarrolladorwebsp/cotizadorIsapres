import type { NextConfig } from "next";

const ENGINE_ORIGIN = "https://isaprespremium.cl";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/inicio",
        destination: "/",
        permanent: true,
      },
      {
        source: "/inicio/:path*",
        destination: "/",
        permanent: true,
      },
      // Motor del cotizador → isaprespremium.cl (query se reenvía automáticamente)
      {
        source: "/cotizador",
        destination: `${ENGINE_ORIGIN}/cotizador`,
        permanent: true,
      },
      {
        source: "/cotizador/:path*",
        destination: `${ENGINE_ORIGIN}/cotizador/:path*`,
        permanent: true,
      },
      {
        source: "/embed",
        destination: `${ENGINE_ORIGIN}/embed`,
        permanent: true,
      },
      {
        source: "/embed/:path*",
        destination: `${ENGINE_ORIGIN}/embed/:path*`,
        permanent: true,
      },
      {
        source: "/isapres",
        destination: `${ENGINE_ORIGIN}/isapres`,
        permanent: true,
      },
      {
        source: "/isapres/:path*",
        destination: `${ENGINE_ORIGIN}/isapres/:path*`,
        permanent: true,
      },
      // APIs del motor (cualquier /api/* excepto assets estáticos de la landing)
      {
        source: "/api/:path*",
        destination: `${ENGINE_ORIGIN}/api/:path*`,
        permanent: true,
      },
      {
        source: "/cotizador-widget.js",
        destination: `${ENGINE_ORIGIN}/cotizador-widget.js`,
        permanent: false,
      },
      {
        source: "/cotizador-widget.js.map",
        destination: `${ENGINE_ORIGIN}/cotizador-widget.js.map`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
