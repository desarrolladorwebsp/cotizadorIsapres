import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración | Cotizador Virtual",
  description: "Gestión de planes de salud y clínicas.",
};

export default function CotizadorAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
