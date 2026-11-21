import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents, type OrderStatus, type EventType } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { transitionOrderSchema } from "@/lib/validations/order";
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

    // Only the assigned volunteer or admin can advance delivery status
    if (order.volunteerId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only the assigned rescue volunteer can transition delivery milestones",
        403
      );
    }

    const body = await req.json();
    const parsed = transitionOrderSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError("VALIDATION_ERROR", "Invalid transition data", 422, fieldErrors);
    }

    const { status: targetStatus, otp, notes, proofPhotoUrl } = parsed.data;

    // Validate lifecycle transitions
    // Lifecycle: accepted -> at_pickup -> collected -> at_receiver -> delivered
    const validTransitions: Record<string, OrderStatus[]> = {
      accepted: ["at_pickup", "cancelled"],
      at_pickup: ["collected", "cancelled"],
      collected: ["at_receiver", "cancelled"],
      at_receiver: ["delivered", "cancelled"],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(targetStatus)) {
      return apiError(
        "INVALID_TRANSITION",
        `Cannot transition order from '${order.status}' to '${targetStatus}'. Allowed: ${allowed.join(", ")}`,
        400
      );
    }

    // Verify OTP handshakes where required
    if (targetStatus === "collected") {
      if (!otp || !verifyHandoffOtp(otp, order.pickupOtp)) {
        return apiError(
          "INVALID_OTP",
          "Incorrect Pickup OTP. Please obtain the 4-digit verification code from the food donor.",
          400
        );
      }
    }

    if (targetStatus === "delivered") {
      if (!otp || !verifyHandoffOtp(otp, order.deliveryOtp)) {
        return apiError(
          "INVALID_OTP",
          "Incorrect Delivery OTP. Please obtain the 4-digit verification code from the receiver representative.",
          400
        );
      }
    }

    const updateFields: Record<string, any> = {
      status: targetStatus,
      updatedAt: new Date(),
    };

    if (targetStatus === "collected") {
      updateFields.collectedAt = new Date();
      // Update listing to 'in_rescue'
      await db
        .update(foodListings)
        .set({ status: "in_rescue", updatedAt: new Date() })
        .where(eq(foodListings.id, order.listingId));
    }

    if (targetStatus === "delivered") {
      updateFields.deliveredAt = new Date();
      // Update listing to 'completed'
      await db
        .update(foodListings)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(foodListings.id, order.listingId));

      // Award Rescue Credits (+50 points) and reset volunteer status to 'available'
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
    }

    const [updatedOrder] = await db
      .update(rescueOrders)
      .set(updateFields)
      .where(eq(rescueOrders.id, id))
      .returning();

    // Map targetStatus to audit event type
    const eventTypeMap: Record<string, EventType> = {
      at_pickup: "arrived_at_pickup",
      collected: "food_collected",
      at_receiver: "arrived_at_receiver",
      delivered: "food_delivered",
      cancelled: "order_cancelled",
    };

    const auditEvent = eventTypeMap[targetStatus] || "order_created";

    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: auditEvent,
      actorId: user.id,
      actorRole: "volunteer",
      notes: notes || `Order advanced to ${targetStatus}`,
      proofPhotoUrl: proofPhotoUrl || null,
    });

    return apiSuccess({
      order: updatedOrder,
      message: `Order successfully advanced to '${targetStatus}'.`,
    });
  } catch (error) {
    console.error("Failed to transition rescue order:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while transitioning order status",
      500
    );
  }
}
