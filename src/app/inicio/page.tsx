import { permanentRedirect } from "next/navigation";

/** `/inicio` → `/` (landing canónica). */
export default function InicioRedirectPage() {
  permanentRedirect("/");
}
