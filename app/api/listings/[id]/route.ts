import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { listingReservations } from "@/db/schema/requests";
import { updateListingSchema } from "@/lib/validations/listing";
import { apiError, apiSuccess } from "@/lib/api/response";
import { FOOD_SAFETY_DISCLAIMER } from "@/lib/constants/food-safety";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db
      .select()
      .from(foodListings)
      .where(eq(foodListings.id, id))
      .limit(1);

    if (!rows[0]) {
      return apiError("NOT_FOUND", "Food listing not found", 404);
    }

    const listing = rows[0];

    // Fetch any reservations
    const reservations = await db
      .select()
      .from(listingReservations)
      .where(eq(listingReservations.listingId, id));

    return apiSuccess({
      ...listing,
      reservations,
      safetyDisclaimer: FOOD_SAFETY_DISCLAIMER,
    });
  } catch (error) {
    console.error("Failed to fetch food listing detail:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while fetching the listing detail",
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
        "You do not have permission to modify this listing",
        403
      );
    }

    // Critical field update blocked if listing is already in active rescue
    if (listing.status === "in_rescue" || listing.status === "completed") {
      return apiError(
        "INVALID_STATE",
        `Cannot edit a listing that is currently in '${listing.status}' status`,
        400
      );
    }

    const body = await req.json();
    const parsed = updateListingSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError(
        "VALIDATION_ERROR",
        "Invalid update payload",
        422,
        fieldErrors
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (parsed.data.handlingNotes !== undefined)
      updateData.handlingNotes = parsed.data.handlingNotes;
    if (parsed.data.pickupBy !== undefined)
      updateData.pickupBy = parsed.data.pickupBy;
    if (parsed.data.status !== undefined)
      updateData.status = parsed.data.status;
    if (parsed.data.quantityPortions !== undefined) {
      // Adjust remaining portions accordingly if listing is still available
      const delta = parsed.data.quantityPortions - listing.quantityPortions;
      updateData.quantityPortions = parsed.data.quantityPortions;
      updateData.remainingPortions = Math.max(0, listing.remainingPortions + delta);
    }

    const updated = await db
      .update(foodListings)
      .set(updateData)
      .where(eq(foodListings.id, id))
      .returning();

    return apiSuccess(updated[0]);
  } catch (error) {
    console.error("Failed to update food listing:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while updating the listing",
      500
    );
  }
}
