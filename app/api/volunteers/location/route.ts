import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { updateVolunteerLocationSchema } from "@/lib/validations/volunteer";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Sign in required", 401);
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return apiError("FORBIDDEN", "Only volunteers can update location", 403);
    }

    const body = await request.json();
    const parsed = updateVolunteerLocationSchema.safeParse(body);

    if (!parsed.success) {
      const msg =
        parsed.error.issues?.[0]?.message || "Invalid location payload";
      return apiError("VALIDATION_ERROR", msg, 422);
    }

    const { locationName, latitude, longitude, preferredRadiusKm, transportMode } =
      parsed.data;

    let [profile] = await db
      .select()
      .from(volunteerProfiles)
      .where(eq(volunteerProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      [profile] = await db
        .insert(volunteerProfiles)
        .values({
          userId: user.id,
          locationName,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          preferredRadiusKm: preferredRadiusKm || 10,
          transportMode: transportMode || "motorcycle",
          availabilityStatus: "available",
        })
        .returning();
    } else {
      [profile] = await db
        .update(volunteerProfiles)
        .set({
          locationName,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          ...(preferredRadiusKm ? { preferredRadiusKm } : {}),
          ...(transportMode ? { transportMode } : {}),
          locationUpdatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(volunteerProfiles.userId, user.id))
        .returning();
    }

    return apiSuccess({
      message: "Volunteer location updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating volunteer location:", error);
    return apiError("INTERNAL_ERROR", "Failed to update volunteer location", 500);
  }
}
