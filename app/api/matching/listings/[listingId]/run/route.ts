import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { receiverProfiles, foodRequests } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { users } from "@/db/schema/users";
import { calculateHaversineDistanceKm } from "@/lib/maps/haversine";
import { rankMatchesForListing } from "@/lib/matching/engine";
import type { ReceiverCandidate, VolunteerCandidate } from "@/lib/matching/types";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { listingId } = await params;
    const listingRows = await db
      .select()
      .from(foodListings)
      .where(eq(foodListings.id, listingId))
      .limit(1);

    if (!listingRows[0]) {
      return apiError("NOT_FOUND", "Food listing not found", 404);
    }

    const listing = listingRows[0];
    const listingLat = Number(listing.latitude);
    const listingLng = Number(listing.longitude);

    // 1. Fetch potential receivers with their profiles and active requests
    const receiversData = await db
      .select({
        userId: users.id,
        organisationName: users.organisationName,
        displayName: users.displayName,
        dailyCapacity: receiverProfiles.dailyCapacityPortions,
        currentCapacity: receiverProfiles.currentCapacityPortions,
        dietaryPreferences: receiverProfiles.dietaryPreferences,
        serviceRadiusKm: receiverProfiles.serviceRadiusKm,
      })
      .from(users)
      .innerJoin(receiverProfiles, eq(users.id, receiverProfiles.userId))
      .where(eq(users.role, "receiver"));

    // Also fetch any active food requests from these receivers
    const activeRequests = await db
      .select()
      .from(foodRequests)
      .where(eq(foodRequests.status, "active"));

    const receiverCandidates: ReceiverCandidate[] = receiversData.map((rec) => {
      // Find matching food request if any
      const matchingReq = activeRequests.find((r) => r.receiverId === rec.userId);
      const reqLat = matchingReq ? Number(matchingReq.latitude) : listingLat + 0.02;
      const reqLng = matchingReq ? Number(matchingReq.longitude) : listingLng + 0.015;
      const locationName = matchingReq ? matchingReq.locationName : "Community Center Shelter";

      const distKm = calculateHaversineDistanceKm(
        listingLat,
        listingLng,
        reqLat,
        reqLng
      );

      return {
        id: rec.userId,
        organisationName:
          rec.organisationName || rec.displayName || "Community Kitchen",
        locationName,
        latitude: reqLat,
        longitude: reqLng,
        distanceFromDonorKm: distKm,
        currentCapacity: rec.currentCapacity,
        dailyCapacity: rec.dailyCapacity,
        acceptedDietaryPreferences: rec.dietaryPreferences,
        activeRequestId: matchingReq?.id,
        requestedPortions: matchingReq?.requestedPortions,
      };
    });

    // 2. Fetch available volunteers
    const volunteersData = await db
      .select({
        userId: users.id,
        displayName: users.displayName,
        firstName: users.firstName,
        transportMode: volunteerProfiles.transportMode,
        locationName: volunteerProfiles.locationName,
        latitude: volunteerProfiles.latitude,
        longitude: volunteerProfiles.longitude,
        preferredRadiusKm: volunteerProfiles.preferredRadiusKm,
        onTimeRate: volunteerProfiles.onTimeRate,
        totalDeliveries: volunteerProfiles.totalDeliveries,
        rescueCredits: volunteerProfiles.rescueCredits,
        availabilityStatus: volunteerProfiles.availabilityStatus,
      })
      .from(users)
      .innerJoin(volunteerProfiles, eq(users.id, volunteerProfiles.userId))
      .where(eq(volunteerProfiles.availabilityStatus, "available"));

    const volunteerCandidates: VolunteerCandidate[] = volunteersData.map((vol) => {
      const volLat = Number(vol.latitude);
      const volLng = Number(vol.longitude);
      const distKm = calculateHaversineDistanceKm(
        listingLat,
        listingLng,
        volLat,
        volLng
      );

      return {
        id: vol.userId,
        displayName: vol.displayName || vol.firstName || "Rescue Volunteer",
        transportMode: vol.transportMode,
        locationName: vol.locationName,
        latitude: volLat,
        longitude: volLng,
        distanceFromDonorKm: distKm,
        preferredRadiusKm: vol.preferredRadiusKm,
        onTimeRate: Number(vol.onTimeRate) || 100,
        totalDeliveries: vol.totalDeliveries,
        rescueCredits: vol.rescueCredits,
        availabilityStatus: vol.availabilityStatus,
      };
    });

    // 3. Run Matching Algorithm
    const rankedMatches = rankMatchesForListing(
      listing,
      receiverCandidates,
      volunteerCandidates
    );

    return apiSuccess({
      listingId: listing.id,
      listingTitle: listing.title,
      totalMatches: rankedMatches.length,
      eligibleMatches: rankedMatches.filter((m) => m.isEligible).length,
      matches: rankedMatches,
    });
  } catch (error) {
    console.error("Failed to execute matching engine:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while running the matching engine",
      500
    );
  }
}
