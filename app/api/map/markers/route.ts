import { NextRequest } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { foodRequests } from "@/db/schema/requests";
import { receiverProfiles } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { users } from "@/db/schema/users";
import { calculateHaversineDistanceKm } from "@/lib/maps/haversine";
import { MapMarker, MarkerRole } from "@/lib/maps/types";
import { ROLE_MARKER_COLORS } from "@/lib/maps/map-styles";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rolesParam = searchParams.get("roles") || "donor,receiver,volunteer";
    const requestedRoles = rolesParam.split(",").map((r) => r.trim().toLowerCase());

    const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
    const radiusKm = searchParams.get("radiusKm") ? parseFloat(searchParams.get("radiusKm")!) : 25;

    const markers: MapMarker[] = [];

    // 1. Collect Active Donor Listings
    if (requestedRoles.includes("donor")) {
      const activeListings = await db
        .select()
        .from(foodListings)
        .where(eq(foodListings.status, "available"));

      for (const listing of activeListings) {
        const lat = parseFloat(listing.latitude);
        const lng = parseFloat(listing.longitude);
        const distance =
          userLat !== null && userLng !== null
            ? calculateHaversineDistanceKm(userLat, userLng, lat, lng)
            : undefined;

        if (distance !== undefined && distance > radiusKm) continue;

        markers.push({
          id: `donor-${listing.id}`,
          role: "donor",
          title: listing.title,
          subtitle: listing.organisationName,
          status: listing.status,
          latitude: lat,
          longitude: lng,
          locationName: listing.locationName,
          portions: listing.remainingPortions,
          dietType: listing.dietType,
          foodCategory: listing.foodCategory,
          expiryTime: listing.pickupBy.toISOString(),
          distanceKm: distance,
          color: ROLE_MARKER_COLORS.donor.bg,
        });
      }
    }

    // 2. Collect Receiver Profiles / Requests
    if (requestedRoles.includes("receiver")) {
      const activeRequests = await db
        .select()
        .from(foodRequests)
        .where(eq(foodRequests.status, "active"));

      for (const req of activeRequests) {
        const lat = parseFloat(req.latitude);
        const lng = parseFloat(req.longitude);
        const distance =
          userLat !== null && userLng !== null
            ? calculateHaversineDistanceKm(userLat, userLng, lat, lng)
            : undefined;

        if (distance !== undefined && distance > radiusKm) continue;

        markers.push({
          id: `receiver-${req.id}`,
          role: "receiver",
          title: req.title,
          subtitle: req.organisationName,
          status: req.status,
          latitude: lat,
          longitude: lng,
          locationName: req.locationName,
          portions: req.requestedPortions,
          dietType: req.dietaryConstraints || "Any",
          distanceKm: distance,
          color: ROLE_MARKER_COLORS.receiver.bg,
        });
      }
    }

    // 3. Collect Active Volunteers
    if (requestedRoles.includes("volunteer")) {
      const volunteers = await db
        .select({
          id: volunteerProfiles.id,
          availabilityStatus: volunteerProfiles.availabilityStatus,
          transportMode: volunteerProfiles.transportMode,
          locationName: volunteerProfiles.locationName,
          latitude: volunteerProfiles.latitude,
          longitude: volunteerProfiles.longitude,
          totalDeliveries: volunteerProfiles.totalDeliveries,
          displayName: users.displayName,
        })
        .from(volunteerProfiles)
        .innerJoin(users, eq(volunteerProfiles.userId, users.id));

      for (const vol of volunteers) {
        const lat = parseFloat(vol.latitude);
        const lng = parseFloat(vol.longitude);
        const distance =
          userLat !== null && userLng !== null
            ? calculateHaversineDistanceKm(userLat, userLng, lat, lng)
            : undefined;

        if (distance !== undefined && distance > radiusKm) continue;

        const volStatus = vol.availabilityStatus as "available" | "busy" | "offline";
        const volColor =
          ROLE_MARKER_COLORS.volunteer[volStatus]?.bg ||
          ROLE_MARKER_COLORS.volunteer.available.bg;

        // Privacy shielding: Anonymize volunteer name (e.g. "Volunteer Rahul V.")
        const safeName = vol.displayName
          ? `Volunteer ${vol.displayName.split(" ")[0]} ${vol.displayName.split(" ")[1]?.charAt(0) || ""}.`
          : "Volunteer Courier";

        markers.push({
          id: `volunteer-${vol.id}`,
          role: "volunteer",
          title: safeName,
          subtitle: `Mode: ${vol.transportMode.toUpperCase()} • ${vol.totalDeliveries} Rescues`,
          status: vol.availabilityStatus,
          latitude: lat,
          longitude: lng,
          locationName: vol.locationName,
          transportMode: vol.transportMode,
          distanceKm: distance,
          color: volColor,
        });
      }
    }

    // Sort markers by distance if origin was provided
    if (userLat !== null && userLng !== null) {
      markers.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return apiSuccess({
      count: markers.length,
      markers,
      origin: userLat !== null && userLng !== null ? { lat: userLat, lng: userLng } : null,
      radiusKm,
    });
  } catch (error) {
    console.error("Error fetching map markers:", error);
    return apiError("INTERNAL_ERROR", "Failed to retrieve map markers", 500);
  }
}
