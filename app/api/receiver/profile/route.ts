import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { receiverProfiles } from "@/db/schema/requests";
import { updateReceiverProfileSchema } from "@/lib/validations/request";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "receiver" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only receiver community organisations have a receiver profile",
        403
      );
    }

    const rows = await db
      .select()
      .from(receiverProfiles)
      .where(eq(receiverProfiles.userId, user.id))
      .limit(1);

    if (rows[0]) {
      return apiSuccess(rows[0]);
    }

    // Auto-create default profile
    const [created] = await db
      .insert(receiverProfiles)
      .values({
        userId: user.id,
        dailyCapacityPortions: 100,
        currentCapacityPortions: 100,
        serviceRadiusKm: 10,
        dietaryPreferences: "Vegetarian, Cooked Meals, Fresh Produce",
        operatingHours: "09:00 - 22:00",
      })
      .returning();

    return apiSuccess(created);
  } catch (error) {
    console.error("Failed to fetch receiver profile:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while fetching receiver profile",
      500
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "receiver" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only receiver community organisations can update receiver profile",
        403
      );
    }

    const body = await req.json();
    const parsed = updateReceiverProfileSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError(
        "VALIDATION_ERROR",
        "Invalid profile data",
        422,
        fieldErrors
      );
    }

    const {
      dailyCapacityPortions,
      currentCapacityPortions,
      dietaryPreferences,
      serviceRadiusKm,
      operatingHours,
    } = parsed.data;

    const [updated] = await db
      .insert(receiverProfiles)
      .values({
        userId: user.id,
        dailyCapacityPortions,
        currentCapacityPortions,
        dietaryPreferences: dietaryPreferences || null,
        serviceRadiusKm,
        operatingHours: operatingHours || null,
      })
      .onConflictDoUpdate({
        target: receiverProfiles.userId,
        set: {
          dailyCapacityPortions,
          currentCapacityPortions,
          dietaryPreferences: dietaryPreferences || null,
          serviceRadiusKm,
          operatingHours: operatingHours || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to update receiver profile:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while updating receiver profile",
      500
    );
  }
}
