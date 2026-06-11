import { redirect } from "next/navigation";
import { COTIZADOR_HOME } from "@/lib/app-routes";

export default function NotFound() {
  redirect(COTIZADOR_HOME);
}
