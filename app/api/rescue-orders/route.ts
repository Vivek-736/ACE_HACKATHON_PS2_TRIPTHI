import { NextRequest } from "next/server";
import { and, desc, eq, or } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { receiverProfiles } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { users } from "@/db/schema/users";
import { createRescueOrderSchema } from "@/lib/validations/order";
import { generateHandoffOtp } from "@/lib/orders/otp";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createNotification } from "@/lib/notifications/service";
import { generateListingClaimedEmail } from "@/lib/email/templates";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const parsed = createRescueOrderSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError("VALIDATION_ERROR", "Invalid order payload", 422, fieldErrors);
    }

    const { listingId, receiverId, volunteerId, allocatedPortions, notes } =
      parsed.data;

    // Fetch listing
    const [listing] = await db
      .select()
      .from(foodListings)
      .where(eq(foodListings.id, listingId))
      .limit(1);

    if (!listing) {
      return apiError("NOT_FOUND", "Food listing not found", 404);
    }

    // Authorization: only the donor of this listing, the receiver, or admin can create the rescue order
    if (
      user.role !== "admin" &&
      listing.donorId !== user.id &&
      receiverId !== user.id
    ) {
      return apiError(
        "FORBIDDEN",
        "You do not have permission to initiate a rescue order for this listing",
        403
      );
    }

    // Availability and portion checks
    if (listing.status !== "available" && listing.status !== "reserved") {
      return apiError(
        "LISTING_UNAVAILABLE",
        `This listing is currently '${listing.status}' and cannot be ordered`,
        400
      );
    }

    if (new Date(listing.pickupBy).getTime() <= Date.now()) {
      return apiError("LISTING_EXPIRED", "This food listing has already expired", 400);
    }

    if (allocatedPortions > listing.remainingPortions) {
      return apiError(
        "OVER_ALLOCATION",
        `Allocated portions (${allocatedPortions}) exceed remaining available portions (${listing.remainingPortions})`,
        400
      );
    }

    // Receiver capacity check
    const [receiverProfile] = await db
      .select()
      .from(receiverProfiles)
      .where(eq(receiverProfiles.userId, receiverId))
      .limit(1);

    if (receiverProfile && receiverProfile.currentCapacityPortions < allocatedPortions) {
      return apiError(
        "CAPACITY_EXCEEDED",
        `Receiver available capacity (${receiverProfile.currentCapacityPortions}) is insufficient for ${allocatedPortions} portions`,
        400
      );
    }

    // Generate secure handoff OTPs
    const pickupOtp = generateHandoffOtp();
    const deliveryOtp = generateHandoffOtp();

    // Determine initial status:
    // If a volunteer is directly assigned, status is 'accepted'; if unassigned, status is 'pending'
    const initialStatus = volunteerId ? "accepted" : "pending";

    // Atomically create rescue order
    const [order] = await db
      .insert(rescueOrders)
      .values({
        listingId,
        receiverId,
        volunteerId: volunteerId || null,
        allocatedPortions,
        status: initialStatus,
        pickupOtp,
        deliveryOtp,
        pickupDeadline: listing.pickupBy,
      })
      .returning();

    // Update listing remaining portions and status
    const newRemaining = listing.remainingPortions - allocatedPortions;
    const newListingStatus = newRemaining === 0 ? "in_rescue" : "available";
    await db
      .update(foodListings)
      .set({
        remainingPortions: newRemaining,
        status: newListingStatus,
        updatedAt: new Date(),
      })
      .where(eq(foodListings.id, listingId));

    // Update receiver profile capacity
    if (receiverProfile) {
      await db
        .update(receiverProfiles)
        .set({
          currentCapacityPortions: Math.max(
            0,
            receiverProfile.currentCapacityPortions - allocatedPortions
          ),
          updatedAt: new Date(),
        })
        .where(eq(receiverProfiles.userId, receiverId));
    }

    // If volunteer assigned, update their status to busy
    if (volunteerId) {
      await db
        .update(volunteerProfiles)
        .set({
          availabilityStatus: "busy",
          updatedAt: new Date(),
        })
        .where(eq(volunteerProfiles.userId, volunteerId));
    }

    // Audit initial events in delivery_events
    await db.insert(deliveryEvents).values({
      orderId: order.id,
      eventType: "order_created",
      actorId: user.id,
      actorRole: (user.role as any) || "system",
      notes: notes || `Rescue order created for ${allocatedPortions} portions`,
    });

    if (volunteerId) {
      await db.insert(deliveryEvents).values({
        orderId: order.id,
        eventType: "assignment_accepted",
        actorId: volunteerId,
        actorRole: "volunteer",
        notes: "Direct volunteer dispatch assigned",
      });
    }

    // Phase 6: Async Notifications & Transactional Email Dispatch
    try {
      const [donorUser] = await db
        .select({
          displayName: users.displayName,
          organisationName: users.organisationName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, listing.donorId))
        .limit(1);

      const [receiverUser] = await db
        .select({
          displayName: users.displayName,
          organisationName: users.organisationName,
        })
        .from(users)
        .where(eq(users.id, receiverId))
        .limit(1);

      const donorName =
        donorUser?.organisationName || donorUser?.displayName || "Donor Partner";
      const receiverName =
        receiverUser?.organisationName || receiverUser?.displayName || "Community Receiver";

      const emailData = generateListingClaimedEmail({
        donorName,
        listingTitle: listing.title,
        portions: allocatedPortions,
        receiverName,
        pickupDeadline: listing.pickupBy.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        }),
        pickupOtp,
        orderId: order.id,
      });

      // Notify Donor
      createNotification({
        userId: listing.donorId,
        type: "listing_claimed",
        title: "Surplus Food Claimed",
        message: `${receiverName} has claimed ${allocatedPortions} portions of "${listing.title}". Verification OTP: ${pickupOtp}.`,
        link: "/dashboard/donor",
        channel: "both",
        emailSubject: emailData.subject,
        emailHtml: emailData.html,
        recipientEmail: donorUser?.email || undefined,
      }).catch((e) => console.warn("Failed notifying donor:", e));

      // If volunteer assigned immediately, notify volunteer
      if (volunteerId) {
        createNotification({
          userId: volunteerId,
          type: "order_assigned",
          title: "New Rescue Mission Assigned",
          message: `You have been dispatched to rescue ${allocatedPortions} portions of "${listing.title}" from ${donorName}.`,
          link: "/dashboard/volunteer",
          channel: "both",
        }).catch((e) => console.warn("Failed notifying volunteer:", e));
      }
    } catch (notifErr) {
      console.warn("[POST /api/rescue-orders] Notification dispatch warning:", notifErr);
    }

    return apiSuccess(order, 201);
  } catch (error) {
    console.error("Failed to create rescue order:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while creating the rescue order",
      500
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Fetch orders with related details
    let query = db
      .select({
        order: rescueOrders,
        listing: foodListings,
        receiverUser: users,
      })
      .from(rescueOrders)
      .innerJoin(foodListings, eq(rescueOrders.listingId, foodListings.id))
      .innerJoin(users, eq(rescueOrders.receiverId, users.id))
      .orderBy(desc(rescueOrders.createdAt));

    const rows = await query;

    // Filter by role:
    // - donor: see orders where listing.donorId === user.id
    // - receiver: see orders where order.receiverId === user.id
    // - volunteer: see orders where order.volunteerId === user.id OR (order.status === 'pending')
    // - admin: see all
    const filtered = rows.filter(({ order, listing }) => {
      if (status && status !== "all" && order.status !== status) {
        return false;
      }

      if (user.role === "admin") return true;
      if (user.role === "donor") return listing.donorId === user.id;
      if (user.role === "receiver") return order.receiverId === user.id;
      if (user.role === "volunteer") {
        return order.volunteerId === user.id || order.status === "pending";
      }
      return false;
    });

    // Mask OTPs based on caller role for security
    const sanitized = filtered.map(({ order, listing, receiverUser }) => {
      const isDonor = listing.donorId === user.id;
      const isReceiver = order.receiverId === user.id;
      const isAdmin = user.role === "admin";

      return {
        ...order,
        listingTitle: listing.title,
        foodCategory: listing.foodCategory,
        dietType: listing.dietType,
        donorLocation: listing.locationName,
        donorOrganisation: listing.organisationName,
        donorLatitude: listing.latitude,
        donorLongitude: listing.longitude,
        receiverOrganisation:
          receiverUser.organisationName || receiverUser.displayName || "Community Receiver",
        // Donors see pickupOtp, Receivers see deliveryOtp, Admin sees both, Volunteers see neither
        pickupOtp: isDonor || isAdmin ? order.pickupOtp : undefined,
        deliveryOtp: isReceiver || isAdmin ? order.deliveryOtp : undefined,
      };
    });

    return apiSuccess(sanitized);
  } catch (error) {
    console.error("Failed to fetch rescue orders:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while retrieving rescue orders",
      500
    );
  }
}
