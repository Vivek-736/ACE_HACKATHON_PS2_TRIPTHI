import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { verifyHandoffOtp } from "@/lib/orders/otp";
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

    const { id } = await params;
    const [order] = await db
      .select()
      .from(rescueOrders)
      .where(eq(rescueOrders.id, id))
      .limit(1);

    if (!order) {
      return apiError("NOT_FOUND", "Rescue order not found", 404);
    }

    // Authorization: only assigned volunteer or admin can verify pickup
    if (order.volunteerId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only the assigned rescue volunteer can verify food collection",
        403
      );
    }

    // Replay attack prevention: check if token already consumed
    if (order.pickupOtpConsumed) {
      return apiError(
        "ALREADY_CONSUMED",
        "This pickup OTP has already been consumed and cannot be reused",
        400
      );
    }

    // State check
    if (order.status !== "at_pickup") {
      return apiError(
        "INVALID_STATE",
        `Order must be in 'at_pickup' status to verify pickup (current: '${order.status}')`,
        400
      );
    }

    // Rate-limit / Attempt limit: max 5 attempts to prevent brute force
    const MAX_ATTEMPTS = 5;
    if (order.pickupAttempts >= MAX_ATTEMPTS) {
      return apiError(
        "MAX_ATTEMPTS_EXCEEDED",
        `Maximum verification attempts exceeded (${MAX_ATTEMPTS}/${MAX_ATTEMPTS}). Verification locked. Please contact support.`,
        429
      );
    }

    const body = await req.json();
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    const notes = typeof body?.notes === "string" ? body.notes : null;

    if (!otp) {
      return apiError("VALIDATION_ERROR", "Pickup OTP is required", 400);
    }

    // Verify OTP code
    const isMatch = verifyHandoffOtp(otp, order.pickupOtp);

    if (!isMatch) {
      const nextAttempts = order.pickupAttempts + 1;
      await db
        .update(rescueOrders)
        .set({
          pickupAttempts: nextAttempts,
          updatedAt: new Date(),
        })
        .where(eq(rescueOrders.id, id));

      const remaining = MAX_ATTEMPTS - nextAttempts;
      return apiError(
        "INVALID_OTP",
        `Incorrect Pickup OTP. Please request the 4-digit code from the donor. ${remaining} attempts remaining before lock.`,
        400
      );
    }

    // Atomic OTP consumption & state transition to 'collected'
    const [updatedOrder] = await db
      .update(rescueOrders)
      .set({
        status: "collected",
        pickupOtpConsumed: true,
        collectedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rescueOrders.id, id))
      .returning();

    // Update food listing status to 'in_rescue'
    await db
      .update(foodListings)
      .set({
        status: "in_rescue",
        updatedAt: new Date(),
      })
      .where(eq(foodListings.id, order.listingId));

    // Audit event in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: "food_collected",
      actorId: user.id,
      actorRole: "volunteer",
      notes: notes || "Food pickup verified via 4-digit donor OTP handshake",
    });

    return apiSuccess({
      order: updatedOrder,
      message: "Pickup verified successfully! Surplus food collected and en route to receiver.",
    });
  } catch (error) {
    console.error("Failed to verify pickup OTP:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while verifying the pickup code",
      500
    );
  }
}
