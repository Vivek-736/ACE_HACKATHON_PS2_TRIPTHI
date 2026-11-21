export interface LatLng {
  lat: number;
  lng: number;
}

export type MarkerRole = "donor" | "receiver" | "volunteer";

export interface MapMarker {
  id: string;
  role: MarkerRole;
  title: string;
  subtitle?: string | null;
  status: string;
  latitude: number;
  longitude: number;
  locationName: string;
  portions?: number;
  dietType?: string | null;
  foodCategory?: string;
  expiryTime?: string;
  distanceKm?: number;
  etaMinutes?: number;
  transportMode?: string;
  color: string;
}

export interface RouteSummary {
  distanceKm: number;
  durationMinutes: number;
  origin: {
    lat: number;
    lng: number;
    label: string;
  };
  destination: {
    lat: number;
    lng: number;
    label: string;
  };
  steps?: string[];
  polyline?: string;
}

export interface NearbyCandidate {
  id: string;
  role: MarkerRole;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  etaMinutes: number;
  details: {
    portions?: number;
    dietType?: string;
    foodCategory?: string;
    status: string;
    transportMode?: string;
    timeRemainingMinutes?: number;
  };
}
