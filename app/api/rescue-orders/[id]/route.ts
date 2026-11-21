import { NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { users } from "@/db/schema/users";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(
  _req: NextRequest,
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
        receiverUser: users,
      })
      .from(rescueOrders)
      .innerJoin(foodListings, eq(rescueOrders.listingId, foodListings.id))
      .innerJoin(users, eq(rescueOrders.receiverId, users.id))
      .where(eq(rescueOrders.id, id))
      .limit(1);

    if (!orderRow) {
      return apiError("NOT_FOUND", "Rescue order not found", 404);
    }

    const { order, listing, receiverUser } = orderRow;

    // Fetch volunteer user details if assigned
    let volunteerUser = null;
    if (order.volunteerId) {
      const [vol] = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          firstName: users.firstName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, order.volunteerId))
        .limit(1);
      volunteerUser = vol || null;
    }

    // Authorization check
    const isDonor = listing.donorId === user.id;
    const isReceiver = order.receiverId === user.id;
    const isAssignedVolunteer = order.volunteerId === user.id;
    const isVolunteerCandidate = user.role === "volunteer" && order.status === "pending";
    const isAdmin = user.role === "admin";

    if (!isDonor && !isReceiver && !isAssignedVolunteer && !isVolunteerCandidate && !isAdmin) {
      return apiError("FORBIDDEN", "You do not have access to this rescue order", 403);
    }

    // Fetch delivery events audit trail
    const events = await db
      .select()
      .from(deliveryEvents)
      .where(eq(deliveryEvents.orderId, id))
      .orderBy(desc(deliveryEvents.createdAt));

    const responseData = {
      ...order,
      listing,
      receiver: {
        id: receiverUser.id,
        organisationName: receiverUser.organisationName || receiverUser.displayName,
      },
      volunteer: volunteerUser,
      timeline: events,
      // Security: Only donor & admin see pickupOtp; only receiver & admin see deliveryOtp
      pickupOtp: isDonor || isAdmin ? order.pickupOtp : undefined,
      deliveryOtp: isReceiver || isAdmin ? order.deliveryOtp : undefined,
    };

    return apiSuccess(responseData);
  } catch (error) {
    console.error("Failed to fetch rescue order detail:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while fetching the order detail",
      500
    );
  }
}
