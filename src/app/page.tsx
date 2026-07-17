import { permanentRedirect } from "next/navigation";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Entrada `/` → cotizador. La landing vive en `/inicio`
 * (no usar `/index`: en Vercel se normaliza a `/`).
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) qs.append(key, item);
    } else {
      qs.set(key, value);
    }
  }

  const query = qs.toString();
  permanentRedirect(query ? `/cotizador?${query}` : "/cotizador");
}
