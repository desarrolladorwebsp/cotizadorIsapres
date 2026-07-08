export interface ClinicLocationRecord {
  address: string;
  lat: number;
  lng: number;
  source?: "curated" | "geocoded" | string;
}

export interface ClinicMapMarker {
  id: string;
  name: string;
  zones: string[];
  location: ClinicLocationRecord;
}
