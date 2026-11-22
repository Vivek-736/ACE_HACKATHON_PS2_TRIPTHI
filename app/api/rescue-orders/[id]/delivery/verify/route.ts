import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { volunteerProfiles } from "@/db/schema/volunteers";
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

    // Authorization: only assigned volunteer or admin can verify delivery
    if (order.volunteerId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only the assigned rescue volunteer can verify food delivery",
        403
      );
    }

    // Replay attack prevention: check if token already consumed
    if (order.deliveryOtpConsumed) {
      return apiError(
        "ALREADY_CONSUMED",
        "This delivery OTP has already been consumed and cannot be reused",
        400
      );
    }

    // State check
    if (order.status !== "at_receiver") {
      return apiError(
        "INVALID_STATE",
        `Order must be in 'at_receiver' status to verify delivery (current: '${order.status}')`,
        400
      );
    }

    // Rate-limit / Attempt limit: max 5 attempts to prevent brute force
    const MAX_ATTEMPTS = 5;
    if (order.deliveryAttempts >= MAX_ATTEMPTS) {
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
      return apiError("VALIDATION_ERROR", "Delivery OTP is required", 400);
    }

    // Verify OTP code
    const isMatch = verifyHandoffOtp(otp, order.deliveryOtp);

    if (!isMatch) {
      const nextAttempts = order.deliveryAttempts + 1;
      await db
        .update(rescueOrders)
        .set({
          deliveryAttempts: nextAttempts,
          updatedAt: new Date(),
        })
        .where(eq(rescueOrders.id, id));

      const remaining = MAX_ATTEMPTS - nextAttempts;
      return apiError(
        "INVALID_OTP",
        `Incorrect Delivery OTP. Please request the 4-digit code from the receiver representative. ${remaining} attempts remaining before lock.`,
        400
      );
    }

    // Atomic OTP consumption & state transition to 'delivered'
    const [updatedOrder] = await db
      .update(rescueOrders)
      .set({
        status: "delivered",
        deliveryOtpConsumed: true,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rescueOrders.id, id))
      .returning();

    // Update food listing status to 'completed'
    await db
      .update(foodListings)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(foodListings.id, order.listingId));

    // Award +50 Rescue Credits, increment totalDeliveries, and set volunteer availability back to 'available'
    if (order.volunteerId) {
      const [vol] = await db
        .select()
        .from(volunteerProfiles)
        .where(eq(volunteerProfiles.userId, order.volunteerId))
        .limit(1);

      if (vol) {
        await db
          .update(volunteerProfiles)
          .set({
            rescueCredits: vol.rescueCredits + 50,
            totalDeliveries: vol.totalDeliveries + 1,
            availabilityStatus: "available",
            updatedAt: new Date(),
          })
          .where(eq(volunteerProfiles.userId, order.volunteerId));
      }
    }

    // Audit event in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: "food_delivered",
      actorId: user.id,
      actorRole: "volunteer",
      notes: notes || "Food delivery verified via 4-digit receiver OTP handshake",
    });

    return apiSuccess({
      order: updatedOrder,
      message: "Delivery verified successfully! 50 Rescue Credits awarded to your account.",
    });
  } catch (error) {
    console.error("Failed to verify delivery OTP:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while verifying the delivery code",
      500
    );
  }
}
