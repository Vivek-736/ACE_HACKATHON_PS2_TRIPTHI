import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { updateVolunteerAvailabilitySchema } from "@/lib/validations/volunteer";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Sign in required", 401);
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return apiError("FORBIDDEN", "Only volunteers can toggle availability", 403);
    }

    const body = await request.json();
    const parsed = updateVolunteerAvailabilitySchema.safeParse(body);

    if (!parsed.success) {
      const msg =
        parsed.error.issues?.[0]?.message || "Invalid availability status";
      return apiError("VALIDATION_ERROR", msg, 422);
    }

    const { availabilityStatus } = parsed.data;

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
          availabilityStatus,
        })
        .returning();
    } else {
      [profile] = await db
        .update(volunteerProfiles)
        .set({
          availabilityStatus,
          updatedAt: new Date(),
        })
        .where(eq(volunteerProfiles.userId, user.id))
        .returning();
    }

    return apiSuccess(profile);
  } catch (error) {
    console.error("Error toggling volunteer availability:", error);
    return apiError("INTERNAL_ERROR", "Failed to toggle availability", 500);
  }
}
