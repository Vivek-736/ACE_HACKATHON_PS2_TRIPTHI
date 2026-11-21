import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { foodRequests } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { users } from "@/db/schema/users";
import {
  calculateHaversineDistanceKm,
  estimateTravelTimeMinutes,
} from "@/lib/maps/haversine";
import { NearbyCandidate } from "@/lib/maps/types";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const radiusKm = Math.min(
      Math.max(parseFloat(searchParams.get("radiusKm") || "15"), 1),
      50
    );

    if (!latStr || !lngStr) {
      return apiError(
        "INVALID_COORDINATES",
        "Both 'lat' and 'lng' query parameters are required",
        400
      );
    }

    const originLat = parseFloat(latStr);
    const originLng = parseFloat(lngStr);

    if (isNaN(originLat) || isNaN(originLng)) {
      return apiError(
        "INVALID_COORDINATES",
        "Coordinates must be valid numbers",
        400
      );
    }

    const candidates: NearbyCandidate[] = [];

    // 1. Nearby Food Listings (Available)
    const activeListings = await db
      .select()
      .from(foodListings)
      .where(eq(foodListings.status, "available"));

    for (const listing of activeListings) {
      const lat = parseFloat(listing.latitude);
      const lng = parseFloat(listing.longitude);
      const distance = calculateHaversineDistanceKm(
        originLat,
        originLng,
        lat,
        lng
      );

      if (distance <= radiusKm) {
        const timeRemaining = Math.max(
          0,
          Math.floor((listing.pickupBy.getTime() - Date.now()) / (60 * 1000))
        );

        candidates.push({
          id: listing.id,
          role: "donor",
          name: listing.title,
          locationName: listing.locationName,
          latitude: lat,
          longitude: lng,
          distanceKm: distance,
          etaMinutes: estimateTravelTimeMinutes(distance, "motorcycle"),
          details: {
            portions: listing.remainingPortions,
            dietType: listing.dietType,
            foodCategory: listing.foodCategory,
            status: listing.status,
            timeRemainingMinutes: timeRemaining,
          },
        });
      }
    }

    // 2. Nearby Receivers / Requests
    const activeRequests = await db
      .select()
      .from(foodRequests)
      .where(eq(foodRequests.status, "active"));

    for (const req of activeRequests) {
      const lat = parseFloat(req.latitude);
      const lng = parseFloat(req.longitude);
      const distance = calculateHaversineDistanceKm(
        originLat,
        originLng,
        lat,
        lng
      );

      if (distance <= radiusKm) {
        candidates.push({
          id: req.id,
          role: "receiver",
          name: req.title,
          locationName: req.locationName,
          latitude: lat,
          longitude: lng,
          distanceKm: distance,
          etaMinutes: estimateTravelTimeMinutes(distance, "motorcycle"),
          details: {
            portions: req.requestedPortions,
            dietType: req.dietaryConstraints || "Any",
            status: req.status,
          },
        });
      }
    }

    // 3. Nearby Available Volunteers
    const volunteers = await db
      .select({
        id: volunteerProfiles.id,
        transportMode: volunteerProfiles.transportMode,
        locationName: volunteerProfiles.locationName,
        latitude: volunteerProfiles.latitude,
        longitude: volunteerProfiles.longitude,
        displayName: users.displayName,
      })
      .from(volunteerProfiles)
      .innerJoin(users, eq(volunteerProfiles.userId, users.id))
      .where(eq(volunteerProfiles.availabilityStatus, "available"));

    for (const vol of volunteers) {
      const lat = parseFloat(vol.latitude);
      const lng = parseFloat(vol.longitude);
      const distance = calculateHaversineDistanceKm(
        originLat,
        originLng,
        lat,
        lng
      );

      if (distance <= radiusKm) {
        const safeName = vol.displayName
          ? `Volunteer ${vol.displayName.split(" ")[0]} ${vol.displayName.split(" ")[1]?.charAt(0) || ""}.`
          : "Volunteer Responder";

        candidates.push({
          id: vol.id,
          role: "volunteer",
          name: safeName,
          locationName: vol.locationName,
          latitude: lat,
          longitude: lng,
          distanceKm: distance,
          etaMinutes: estimateTravelTimeMinutes(distance, vol.transportMode),
          details: {
            status: "available",
            transportMode: vol.transportMode,
          },
        });
      }
    }

    // Sort by proximity
    candidates.sort((a, b) => a.distanceKm - b.distanceKm);

    return apiSuccess({
      origin: { lat: originLat, lng: originLng },
      radiusKm,
      totalCount: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("Error retrieving nearby candidates:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve nearby candidates", 500);
  }
}
