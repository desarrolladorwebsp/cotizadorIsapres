import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cotizador Inteligente",
  description: "Sistema inteligente de cotizaciones para planes de Isapre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-clip overscroll-none antialiased`}
    >
      <body className="flex min-h-full max-w-full flex-col overflow-x-clip overscroll-none bg-bg-layout text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
