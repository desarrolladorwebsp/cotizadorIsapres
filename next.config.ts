import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      {
        source: "/cotizador",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
