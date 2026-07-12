import clinicLocationsAsset from "@/assets/clinic-locations.json";
import type { Clinic } from "@/types/clinic";
import type {
  ClinicLocationRecord,
  ClinicMapMarker,
  UniqueClinicMapLocation,
} from "@/types/clinic-location";
import { locationKeyFromRecord } from "@/types/clinic-location";

const clinicLocations = clinicLocationsAsset as {
  locations: Record<string, ClinicLocationRecord>;
};

export function getClinicLocation(clinicId: string): ClinicLocationRecord | null {
  return clinicLocations.locations[clinicId] ?? null;
}

export function attachClinicLocations(clinics: Clinic[]): ClinicMapMarker[] {
  return clinics.flatMap((clinic) => {
    const location = getClinicLocation(clinic.id);
    if (!location) return [];

    return [
      {
        id: clinic.id,
        name: clinic.name,
        zones: clinic.zones,
        location,
      },
    ];
  });
}

export function dedupeClinicMapLocations(
  markers: ClinicMapMarker[],
): UniqueClinicMapLocation[] {
  const byKey = new Map<string, UniqueClinicMapLocation>();

  for (const marker of markers) {
    const locationKey = locationKeyFromRecord(marker.location);
    const existing = byKey.get(locationKey);

    if (existing) {
      existing.clinics.push(marker);
      continue;
    }

    byKey.set(locationKey, {
      locationKey,
      location: marker.location,
      clinics: [marker],
    });
  }

  return [...byKey.values()].sort((a, b) =>
    a.location.address.localeCompare(b.location.address, "es"),
  );
}

export function countClinicsWithLocation(clinics: Clinic[]): number {
  return attachClinicLocations(clinics).length;
}

export function countUniqueClinicLocations(clinics: Clinic[]): number {
  return dedupeClinicMapLocations(attachClinicLocations(clinics)).length;
}
