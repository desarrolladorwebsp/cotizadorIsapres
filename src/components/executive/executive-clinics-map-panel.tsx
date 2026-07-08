"use client";

import { useMemo, useState } from "react";
import { GoogleMapsClinicsMap } from "@/components/maps/google-maps-clinics-map";
import { Input } from "@/components/ui/input";
import {
  AdminBadge,
  AdminPanel,
  AdminPanelHeader,
  AdminRefreshButton,
} from "@/components/admin/admin-data-table";
import { getClinicZoneIds, getZoneLabel } from "@/lib/clinic-admin";
import { attachClinicLocations } from "@/lib/clinic-locations";
import { ZONE_FILTER_OPTIONS } from "@/lib/filter-options";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { Clinic } from "@/types/clinic";

export interface ExecutiveClinicsMapPanelProps {
  clinics: Clinic[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function ExecutiveClinicsMapPanel({
  clinics,
  loading,
  onRefresh,
}: ExecutiveClinicsMapPanelProps) {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const markers = useMemo(() => attachClinicLocations(clinics), [clinics]);

  const filteredMarkers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return markers.filter((marker) => {
      const zoneIds = marker.zones.length > 0 ? marker.zones : [];
      const resolvedZones =
        zoneIds.length > 0
          ? zoneIds
          : getClinicZoneIds({ id: marker.id, name: marker.name, zones: [] });

      if (zoneFilter !== "all" && !resolvedZones.includes(zoneFilter)) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        marker.name,
        marker.location.address,
        ...resolvedZones.map((zoneId) => getZoneLabel(zoneId)),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [markers, search, zoneFilter]);

  const withoutLocation = clinics.length - markers.length;

  return (
    <AdminPanel>
      <AdminPanelHeader
        title="Mapa de clínicas"
        description="Ubicaciones reales de prestadores del catálogo en Google Maps. Filtra por zona o nombre para orientar cotizaciones y asesorías."
        actions={<AdminRefreshButton onClick={() => void onRefresh()} />}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
        <GoogleMapsClinicsMap
          markers={filteredMarkers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <AdminBadge tone="success">{filteredMarkers.length} en mapa</AdminBadge>
              <AdminBadge tone="neutral">{clinics.length} clínicas</AdminBadge>
              {withoutLocation > 0 ? (
                <AdminBadge tone="warning">{withoutLocation} sin ubicación</AdminBadge>
              ) : null}
            </div>

            <div className="mt-4 space-y-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar clínica o dirección…"
                className={joinClasses("h-11", ui.input)}
              />
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Zona
                </span>
                <select
                  value={zoneFilter}
                  onChange={(event) => setZoneFilter(event.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <option value="all">Todas las zonas</option>
                  {ZONE_FILTER_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="max-h-[min(52vh,480px)] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Listado</p>
              <p className="text-xs text-muted">
                Toca una clínica para centrarla en el mapa.
              </p>
            </div>
            <ul className="max-h-[calc(min(52vh,480px)-64px)] overflow-y-auto">
              {loading ? (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  Cargando clínicas…
                </li>
              ) : filteredMarkers.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  No hay clínicas con los filtros actuales.
                </li>
              ) : (
                filteredMarkers.map((marker) => {
                  const zoneIds =
                    marker.zones.length > 0
                      ? marker.zones
                      : getClinicZoneIds({
                          id: marker.id,
                          name: marker.name,
                          zones: [],
                        });
                  const isSelected = selectedId === marker.id;

                  return (
                    <li key={marker.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(marker.id)}
                        className={joinClasses(
                          "w-full border-b border-border/70 px-4 py-3 text-left transition",
                          isSelected
                            ? "bg-primary/8"
                            : "hover:bg-secondary-muted/50",
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {marker.name}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {marker.location.address}
                        </p>
                        {zoneIds[0] ? (
                          <p className="mt-2 text-[11px] font-medium text-primary">
                            {getZoneLabel(zoneIds[0])}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </aside>
      </div>
    </AdminPanel>
  );
}
