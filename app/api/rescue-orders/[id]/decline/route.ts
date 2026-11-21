import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
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
    const [order] = await db
      .select()
      .from(rescueOrders)
      .where(eq(rescueOrders.id, id))
      .limit(1);

    if (!order) {
      return apiError("NOT_FOUND", "Rescue order not found", 404);
    }

    // Only the assigned volunteer or admin can decline
    if (order.volunteerId !== user.id && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "You are not the assigned volunteer for this order",
        403
      );
    }

    if (order.status !== "accepted" && order.status !== "pending") {
      return apiError(
        "INVALID_STATE",
        `Cannot decline an order currently in '${order.status}' status`,
        400
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Volunteer declined assignment";

    // Unassign volunteer and return order to 'pending'
    const [updated] = await db
      .update(rescueOrders)
      .set({
        volunteerId: null,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(rescueOrders.id, id))
      .returning();

    // Reset volunteer status to 'available'
    await db
      .update(volunteerProfiles)
      .set({
        availabilityStatus: "available",
        updatedAt: new Date(),
      })
      .where(eq(volunteerProfiles.userId, user.id));

    // Audit in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: id,
      eventType: "assignment_declined",
      actorId: user.id,
      actorRole: "volunteer",
      notes: reason,
    });

    return apiSuccess({
      order: updated,
      message: "Assignment declined. Order has been returned to the dispatch queue.",
    });
  } catch (error) {
    console.error("Failed to decline rescue order:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while declining the order",
      500
    );
  }
}
