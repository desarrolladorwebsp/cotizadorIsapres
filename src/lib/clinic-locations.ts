import clinicLocationsAsset from "@/assets/clinic-locations.json";
import type { Clinic } from "@/types/clinic";
import type { ClinicLocationRecord, ClinicMapMarker } from "@/types/clinic-location";

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

export function countClinicsWithLocation(clinics: Clinic[]): number {
  return attachClinicLocations(clinics).length;
}
