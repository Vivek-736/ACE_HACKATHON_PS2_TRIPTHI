import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(
  _req: NextRequest,
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
      .from(foodListings)
      .where(eq(foodListings.id, id))
      .limit(1);

    if (!existing[0]) {
      return apiError("NOT_FOUND", "Food listing not found", 404);
    }

    const listing = existing[0];

    // Ownership check
    if (listing.donorId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "You do not have permission to cancel this listing",
        403
      );
    }

    if (listing.status === "completed") {
      return apiError(
        "INVALID_STATE",
        "Completed listings cannot be cancelled",
        400
      );
    }

    const updated = await db
      .update(foodListings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(foodListings.id, id))
      .returning();

    return apiSuccess(updated[0]);
  } catch (error) {
    console.error("Failed to cancel listing:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while cancelling the listing",
      500
    );
  }
}
