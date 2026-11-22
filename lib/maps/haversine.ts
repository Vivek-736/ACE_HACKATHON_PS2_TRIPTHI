import { LatLng } from "./types";

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight-line great-circle distance between two coordinates in kilometers
 * using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const radLat1 = degreesToRadians(lat1);
  const radLat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(radLat1) *
      Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Checks if target coordinates are within a specified radius in kilometers of the origin.
 */
export function isWithinRadius(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
): boolean {
  return (
    calculateHaversineDistanceKm(originLat, originLng, targetLat, targetLng) <=
    radiusKm
  );
}

/**
 * Returns a latitude/longitude bounding box (minLat, maxLat, minLng, maxLng)
 * around a center point for rapid SQL / database range filtering.
 */
export function calculateBoundingBox(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Approximate conversion: 1 deg latitude ≈ 111.0 km
  const latDelta = radiusKm / 111.0;
  // 1 deg longitude ≈ 111.0 * cos(latitude) km
  const lngDelta = radiusKm / (111.0 * Math.cos(degreesToRadians(centerLat)));

  return {
    minLat: Math.round((centerLat - latDelta) * 1000000) / 1000000,
    maxLat: Math.round((centerLat + latDelta) * 1000000) / 1000000,
    minLng: Math.round((centerLng - lngDelta) * 1000000) / 1000000,
    maxLng: Math.round((centerLng + lngDelta) * 1000000) / 1000000,
  };
}

/**
 * Estimates realistic ground travel time in minutes based on distance and transport mode.
 * Speeds account for urban congestion (km/h):
 * - motorcycle: 28 km/h + 3 min buffer
 * - bicycle: 14 km/h + 2 min buffer
 * - car: 22 km/h + 5 min buffer
 * - on_foot: 4.5 km/h + 1 min buffer
 */
export function estimateTravelTimeMinutes(
  distanceKm: number,
  transportMode: string = "motorcycle"
): number {
  let avgSpeedKmh = 28;
  let pickupBuffer = 3;

  switch (transportMode) {
    case "bicycle":
      avgSpeedKmh = 14;
      pickupBuffer = 2;
      break;
    case "car":
      avgSpeedKmh = 22;
      pickupBuffer = 5;
      break;
    case "delivery_truck":
    case "truck":
      avgSpeedKmh = 20;
      pickupBuffer = 6;
      break;
    case "on_foot":
      avgSpeedKmh = 4.5;
      pickupBuffer = 1;
      break;
    case "motorcycle":
    default:
      avgSpeedKmh = 28;
      pickupBuffer = 3;
      break;
  }

  const travelMinutes = (distanceKm / avgSpeedKmh) * 60;
  return Math.ceil(travelMinutes + pickupBuffer);
}
