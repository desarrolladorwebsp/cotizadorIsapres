import type { ClientOrigin } from "@/types/user";
import type { CotizadorSourceInfo } from "@/lib/partner-entity/source-label";
import { getCotizadorSourceBadgeClass } from "@/lib/partner-entity/source-label";
import { AdminBadge } from "@/components/admin/admin-data-table";

export const CLIENT_ORIGIN_LABELS: Record<ClientOrigin, string> = {
  COTIZADOR: "Lead cotizador",
  MANUAL: "Registro propio",
};

export interface ClientOriginBadgeProps {
  origin?: ClientOrigin;
  cotizadorSource?: CotizadorSourceInfo | null;
}

export function ClientOriginBadge({
  origin = "MANUAL",
  cotizadorSource,
}: ClientOriginBadgeProps) {
  if (origin === "COTIZADOR") {
    const label = cotizadorSource?.description ?? CLIENT_ORIGIN_LABELS.COTIZADOR;
    const badgeClass = getCotizadorSourceBadgeClass(cotizadorSource?.slug);

    return (
      <AdminBadge
        className={badgeClass}
        title={
          cotizadorSource?.slug
            ? `Lead desde ${cotizadorSource.label} (/${cotizadorSource.slug})`
            : "Lead generado desde el cotizador"
        }
      >
        {label}
      </AdminBadge>
    );
  }

  return (
    <AdminBadge
      tone="success"
      title="Agregado manualmente por el ejecutivo"
    >
      {CLIENT_ORIGIN_LABELS.MANUAL}
    </AdminBadge>
  );
}
