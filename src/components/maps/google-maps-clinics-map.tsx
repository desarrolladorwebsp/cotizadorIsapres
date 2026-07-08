"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { ClinicMapMarker } from "@/types/clinic-location";

const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 };
const DEFAULT_ZOOM = 6;

interface GoogleMapsClinicsMapProps {
  markers: ClinicMapMarker[];
  selectedId?: string | null;
  onSelect?: (clinicId: string) => void;
  className?: string;
}

function getMapsApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  return key || null;
}

export function GoogleMapsClinicsMap({
  markers,
  selectedId = null,
  onSelect,
  className,
}: GoogleMapsClinicsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerByIdRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = getMapsApiKey();
    if (!apiKey) {
      setLoadState("error");
      setErrorMessage(
        "Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para mostrar el mapa.",
      );
      return;
    }

    if (!containerRef.current) return;

    let cancelled = false;

    setOptions({ key: apiKey, v: "weekly" });

    void importLibrary("maps")
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadState("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo cargar Google Maps.",
        );
      });

    return () => {
      cancelled = true;
      clustererRef.current?.clearMarkers();
      markerByIdRef.current.clear();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loadState !== "ready") return;

    clustererRef.current?.clearMarkers();
    markerByIdRef.current.clear();

    const infoWindow = infoWindowRef.current;
    const nextMarkers: google.maps.Marker[] = [];

    for (const clinic of markers) {
      const marker = new google.maps.Marker({
        map,
        position: { lat: clinic.location.lat, lng: clinic.location.lng },
        title: clinic.name,
      });

      marker.addListener("click", () => {
        onSelect?.(clinic.id);
        if (infoWindow) {
          infoWindow.setContent(
            `<div style="max-width:220px;padding:4px 2px;font-family:system-ui,sans-serif">
              <p style="margin:0 0 6px;font-weight:700;color:#0b2545">${clinic.name}</p>
              <p style="margin:0;font-size:12px;color:#6b8494;line-height:1.4">${clinic.location.address}</p>
            </div>`,
          );
          infoWindow.open({ map, anchor: marker });
        }
      });

      markerByIdRef.current.set(clinic.id, marker);
      nextMarkers.push(marker);
    }

    clustererRef.current = new MarkerClusterer({ map, markers: nextMarkers });

    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      for (const clinic of markers) {
        bounds.extend({ lat: clinic.location.lat, lng: clinic.location.lng });
      }
      map.fitBounds(bounds, 48);
    } else {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [markers, loadState, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow || !selectedId) return;

    const marker = markerByIdRef.current.get(selectedId);
    const clinic = markers.find((item) => item.id === selectedId);
    if (!marker || !clinic) return;

    map.panTo({ lat: clinic.location.lat, lng: clinic.location.lng });
    map.setZoom(Math.max(map.getZoom() ?? 12, 13));
    infoWindow.setContent(
      `<div style="max-width:220px;padding:4px 2px;font-family:system-ui,sans-serif">
        <p style="margin:0 0 6px;font-weight:700;color:#0b2545">${clinic.name}</p>
        <p style="margin:0;font-size:12px;color:#6b8494;line-height:1.4">${clinic.location.address}</p>
      </div>`,
    );
    infoWindow.open({ map, anchor: marker });
  }, [selectedId, markers]);

  if (loadState === "error") {
    return (
      <div
        className={`flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary-muted/40 p-6 text-center text-sm text-muted ${className ?? ""}`}
      >
        {errorMessage}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border shadow-sm ${className ?? ""}`}>
      {loadState === "loading" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 text-sm text-muted">
          Cargando mapa…
        </div>
      ) : null}
      <div ref={containerRef} className="h-[min(68vh,560px)] w-full bg-secondary-muted/30" />
    </div>
  );
}
