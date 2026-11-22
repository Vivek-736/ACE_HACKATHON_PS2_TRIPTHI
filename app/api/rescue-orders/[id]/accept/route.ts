import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { foodListings } from "@/db/schema/listings";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createNotification } from "@/lib/notifications/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only rescue volunteers can accept delivery assignments",
        403
      );
    }

    const { id } = await params;

    // Concurrency & eligibility protection:
    // Check order is in 'pending' status
    const [order] = await db
      .select()
      .from(rescueOrders)
      .where(eq(rescueOrders.id, id))
      .limit(1);

    if (!order) {
      return apiError("NOT_FOUND", "Rescue order not found", 404);
    }

    // Atomic conflict check:
    // If order is not pending or has already been accepted by another volunteer, reject with 409 Conflict
    if (order.status !== "pending" || order.volunteerId !== null) {
      return apiError(
        "CONFLICT",
        "This rescue assignment has already been accepted by another volunteer",
        409
      );
    }

    // Check if listing is expired
    if (new Date(order.pickupDeadline).getTime() <= Date.now()) {
      return apiError(
        "EXPIRED",
        "This rescue order has expired past its pickup deadline",
        400
      );
    }

    // Check if caller already has an active rescue in progress
    const activeVolOrders = await db
      .select()
      .from(rescueOrders)
      .where(
        and(
          eq(rescueOrders.volunteerId, user.id),
          eq(rescueOrders.status, "accepted")
        )
      )
      .limit(1);

    if (activeVolOrders.length > 0) {
      return apiError(
        "ACTIVE_ORDER_EXISTS",
        "You already have an active rescue delivery in progress. Complete it before accepting another.",
        400
      );
    }

    // Atomically claim order: conditional update where id = id AND status = 'pending'
    const updated = await db
      .update(rescueOrders)
      .set({
        volunteerId: user.id,
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(and(eq(rescueOrders.id, id), eq(rescueOrders.status, "pending")))
      .returning();

    if (!updated[0]) {
      // Race condition lost to another concurrent claim
      return apiError(
        "CONFLICT",
        "This rescue assignment was just claimed by another volunteer",
        409
      );
    }

    // Update volunteer availability status to 'busy'
    await db
      .update(volunteerProfiles)
      .set({
        availabilityStatus: "busy",
        updatedAt: new Date(),
      })
      .where(eq(volunteerProfiles.userId, user.id));

    // Audit event in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: "assignment_accepted",
      actorId: user.id,
      actorRole: "volunteer",
      notes: "Volunteer accepted rescue delivery assignment",
    });

    // Notify Donor and Receiver that volunteer is assigned and en route
    try {
      const [listing] = await db
        .select({ donorId: foodListings.donorId, title: foodListings.title })
        .from(foodListings)
        .where(eq(foodListings.id, order.listingId))
        .limit(1);

      if (listing) {
        createNotification({
          userId: listing.donorId,
          type: "order_assigned",
          title: "Courier En Route for Pickup",
          message: `${user.displayName || "A volunteer"} has accepted your rescue order for "${listing.title}" and is heading your way.`,
          link: "/dashboard/donor",
        }).catch((e) => console.warn("Failed notifying donor of volunteer accept:", e));
      }

      createNotification({
        userId: order.receiverId,
        type: "order_assigned",
        title: "Courier Assigned to Your Order",
        message: `${user.displayName || "A volunteer"} has been assigned to transport your food rescue delivery.`,
        link: "/dashboard/receiver",
      }).catch((e) => console.warn("Failed notifying receiver of volunteer accept:", e));
    } catch (notifErr) {
      console.warn("[POST accept] Notification warning:", notifErr);
    }

    return apiSuccess({
      order: updated[0],
      message: "Rescue assignment accepted! Head to the donor location to collect food.",
    });
  } catch (error) {
    console.error("Failed to accept rescue order:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while accepting the assignment",
      500
    );
  }
}
