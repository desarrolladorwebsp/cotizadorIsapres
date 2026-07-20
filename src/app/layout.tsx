import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { EMBED_DOCUMENT_HEADER } from "@/lib/embed/is-embed-request";
import { COTIZADOR_PREMIUM_PALETTE } from "@/lib/partner-entity/cotizador-premium-palette";
import { buildRootMetadata } from "@/lib/seo/build-page-metadata";
import { isLegacySeoHostname, normalizeHostname } from "@/lib/seo/request-host";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = normalizeHostname(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
  );
  return buildRootMetadata({
    forceNoIndex: isLegacySeoHostname(host),
  });
}

export const viewport: Viewport = {
  themeColor: COTIZADOR_PREMIUM_PALETTE.primary,
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const isEmbedDocument = headerList.get(EMBED_DOCUMENT_HEADER) === "1";

  return (
    <html
      lang="es"
      data-cotizador-embed={isEmbedDocument ? "true" : undefined}
      className={`${geistSans.variable} ${geistMono.variable} ${isEmbedDocument ? "" : "h-full"} overflow-x-clip overscroll-none antialiased`}
    >
      <body
        className={
          isEmbedDocument
            ? "block max-w-full overflow-x-clip overscroll-none bg-bg-layout text-foreground"
            : "flex min-h-full max-w-full flex-col overflow-x-clip overscroll-none bg-bg-layout text-foreground"
        }
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
