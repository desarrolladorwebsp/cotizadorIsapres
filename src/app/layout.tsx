import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { EMBED_DOCUMENT_HEADER } from "@/lib/embed/is-embed-request";
import { buildRootMetadata } from "@/lib/seo/build-page-metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: "#0077B6",
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
