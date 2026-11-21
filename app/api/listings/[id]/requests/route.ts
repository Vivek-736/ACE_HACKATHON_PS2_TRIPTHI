import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { listingReservations, receiverProfiles } from "@/db/schema/requests";
import { reserveListingSchema } from "@/lib/validations/request";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "receiver" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only receiver community organisations can reserve or request surplus food",
        403
      );
    }

    const { id } = await params;
    const listingRows = await db
      .select()
      .from(foodListings)
      .where(eq(foodListings.id, id))
      .limit(1);

    if (!listingRows[0]) {
      return apiError("NOT_FOUND", "Food listing not found", 404);
    }

    const listing = listingRows[0];

    // Status check
    if (listing.status !== "available") {
      return apiError(
        "UNAVAILABLE",
        `This listing is currently ${listing.status} and cannot be reserved`,
        400
      );
    }

    // Expiry check
    if (new Date(listing.pickupBy).getTime() <= Date.now()) {
      return apiError(
        "EXPIRED",
        "This listing has reached its pickup deadline and is expired",
        400
      );
    }

    const body = await req.json();
    const parsed = reserveListingSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError(
        "VALIDATION_ERROR",
        "Invalid reservation request",
        422,
        fieldErrors
      );
    }

    const { portionsRequested, notes } = parsed.data;

    // Over-allocation check
    if (portionsRequested > listing.remainingPortions) {
      return apiError(
        "OVER_ALLOCATION",
        `Requested portions (${portionsRequested}) exceed remaining portions (${listing.remainingPortions})`,
        400
      );
    }

    // Receiver capacity check
    const profileRows = await db
      .select()
      .from(receiverProfiles)
      .where(eq(receiverProfiles.userId, user.id))
      .limit(1);

    let profile = profileRows[0];
    if (!profile) {
      // Auto-create default receiver profile if not yet created
      const newProfile = await db
        .insert(receiverProfiles)
        .values({
          userId: user.id,
          dailyCapacityPortions: 100,
          currentCapacityPortions: 100,
        })
        .returning();
      profile = newProfile[0];
    }

    if (profile.currentCapacityPortions < portionsRequested) {
      return apiError(
        "CAPACITY_EXCEEDED",
        `Your organization's remaining capacity (${profile.currentCapacityPortions} portions) is insufficient for this request (${portionsRequested} portions)`,
        400
      );
    }

    // Atomic reservation & quantity decrement
    const newRemaining = listing.remainingPortions - portionsRequested;
    const newStatus = newRemaining === 0 ? "reserved" : "available";

    const [createdReservation] = await db
      .insert(listingReservations)
      .values({
        listingId: listing.id,
        receiverId: user.id,
        portionsReserved: portionsRequested,
        notes: notes || null,
        status: "confirmed",
      })
      .returning();

    const [updatedListing] = await db
      .update(foodListings)
      .set({
        remainingPortions: newRemaining,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(foodListings.id, listing.id))
      .returning();

    // Deduct receiver capacity
    await db
      .update(receiverProfiles)
      .set({
        currentCapacityPortions: Math.max(
          0,
          profile.currentCapacityPortions - portionsRequested
        ),
        updatedAt: new Date(),
      })
      .where(eq(receiverProfiles.userId, user.id));

    return apiSuccess(
      {
        reservation: createdReservation,
        listing: updatedListing,
        message: "Surplus food successfully reserved!",
      },
      201
    );
  } catch (error) {
    console.error("Failed to reserve food listing:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while reserving the listing",
      500
    );
  }
}
