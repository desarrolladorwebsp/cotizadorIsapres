import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cotizador",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
