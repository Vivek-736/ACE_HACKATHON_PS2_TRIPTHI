import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Sign in required", 401);
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return apiError("FORBIDDEN", "Only volunteers can access volunteer profiles", 403);
    }

    let [profile] = await db
      .select()
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.userId, user.id))
      .limit(1);

    // Auto-initialize profile with Madhapur demo coordinates if not yet present
    if (!profile) {
      [profile] = await db
        .insert(volunteerProfiles)
        .values({
          userId: user.id,
          availabilityStatus: "available",
          preferredRadiusKm: 10,
          transportMode: "motorcycle",
          locationName: "Cyber Pearl, Madhapur",
          latitude: "17.4483",
          longitude: "78.3815",
          rescueCredits: 50, // Welcome credits
          totalDeliveries: 0,
        })
        .returning();
    }

    return apiSuccess(profile);
  } catch (error) {
    console.error("Error retrieving volunteer profile:", error);
    return apiError("INTERNAL_ERROR", "Failed to get volunteer profile", 500);
  }
}
