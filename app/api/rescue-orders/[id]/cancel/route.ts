import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { receiverProfiles } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
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
    const [orderRow] = await db
      .select({
        order: rescueOrders,
        listing: foodListings,
      })
      .from(rescueOrders)
      .innerJoin(foodListings, eq(rescueOrders.listingId, foodListings.id))
      .where(eq(rescueOrders.id, id))
      .limit(1);

    if (!orderRow) {
      return apiError("NOT_FOUND", "Rescue order not found", 404);
    }

    const { order, listing } = orderRow;

    // Authorization: Donor, Receiver, Volunteer, or Admin
    const isDonor = listing.donorId === user.id;
    const isReceiver = order.receiverId === user.id;
    const isVolunteer = order.volunteerId === user.id;
    const isAdmin = user.role === "admin";

    if (!isDonor && !isReceiver && !isVolunteer && !isAdmin) {
      return apiError(
        "FORBIDDEN",
        "You do not have permission to cancel this rescue order",
        403
      );
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return apiError(
        "INVALID_STATE",
        `Cannot cancel an order that is already '${order.status}'`,
        400
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Order cancelled by participant";

    // Update order status to 'cancelled'
    const [cancelledOrder] = await db
      .update(rescueOrders)
      .set({
        status: "cancelled",
        cancellationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(rescueOrders.id, id))
      .returning();

    // If food was not yet collected, restore remaining portions to listing
    if (order.status === "pending" || order.status === "accepted" || order.status === "at_pickup") {
      await db
        .update(foodListings)
        .set({
          remainingPortions: listing.remainingPortions + order.allocatedPortions,
          status: "available",
          updatedAt: new Date(),
        })
        .where(eq(foodListings.id, listing.id));

      // Restore receiver capacity
      const [recProfile] = await db
        .select()
        .from(receiverProfiles)
        .where(eq(receiverProfiles.userId, order.receiverId))
        .limit(1);

      if (recProfile) {
        await db
          .update(receiverProfiles)
          .set({
            currentCapacityPortions: Math.min(
              recProfile.dailyCapacityPortions,
              recProfile.currentCapacityPortions + order.allocatedPortions
            ),
            updatedAt: new Date(),
          })
          .where(eq(receiverProfiles.userId, order.receiverId));
      }
    }

    // Release volunteer if assigned
    if (order.volunteerId) {
      await db
        .update(volunteerProfiles)
        .set({
          availabilityStatus: "available",
          updatedAt: new Date(),
        })
        .where(eq(volunteerProfiles.userId, order.volunteerId));
    }

    // Audit event in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: "order_cancelled",
      actorId: user.id,
      actorRole: (user.role as any) || "system",
      notes: reason,
    });

    return apiSuccess({
      order: cancelledOrder,
      message: "Rescue order successfully cancelled.",
    });
  } catch (error) {
    console.error("Failed to cancel rescue order:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while cancelling the order",
      500
    );
  }
}
