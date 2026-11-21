import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodRequests } from "@/db/schema/requests";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(foodRequests)
      .where(eq(foodRequests.id, id))
      .limit(1);

    if (!rows[0]) {
      return apiError("NOT_FOUND", "Food request not found", 404);
    }

    return apiSuccess(rows[0]);
  } catch (error) {
    console.error("Failed to fetch food request:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while fetching the food request",
      500
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = await params;
    const existing = await db
      .select()
      .from(foodRequests)
      .where(eq(foodRequests.id, id))
      .limit(1);

    if (!existing[0]) {
      return apiError("NOT_FOUND", "Food request not found", 404);
    }

    const request = existing[0];

    // Ownership check
    if (request.receiverId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "You do not have permission to modify this request",
        403
      );
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status && ["active", "matched", "fulfilled", "cancelled"].includes(body.status)) {
      updateData.status = body.status;
    }

    if (body.requestedPortions && typeof body.requestedPortions === "number") {
      updateData.requestedPortions = body.requestedPortions;
    }

    if (body.foodPreferences) {
      updateData.foodPreferences = String(body.foodPreferences);
    }

    const [updated] = await db
      .update(foodRequests)
      .set(updateData)
      .where(eq(foodRequests.id, id))
      .returning();

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to update food request:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while updating the food request",
      500
    );
  }
}
