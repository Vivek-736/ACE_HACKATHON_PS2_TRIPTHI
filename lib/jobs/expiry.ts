import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { rescueOrders } from "@/db/schema/orders";
import { users } from "@/db/schema/users";
import { createNotification } from "@/lib/notifications/service";
import {
  generateListingExpiredEmail,
  generateVolunteerReminderEmail,
} from "@/lib/email/templates";
import { and, eq, lte, gte, inArray } from "drizzle-orm";

/**
 * Sweeps for expired listings and marks them expired, notifying the donor.
 */
export async function processListingExpiry(): Promise<{
  expiredCount: number;
  expiredListingIds: string[];
}> {
  const now = new Date();

  // Find all available listings whose pickup deadline has passed
  const expiredCandidates = await db
    .select({
      id: foodListings.id,
      title: foodListings.title,
      donorId: foodListings.donorId,
      remainingPortions: foodListings.remainingPortions,
      pickupBy: foodListings.pickupBy,
    })
    .from(foodListings)
    .where(
      and(
        eq(foodListings.status, "available"),
        lte(foodListings.pickupBy, now)
      )
    );

  if (expiredCandidates.length === 0) {
    return { expiredCount: 0, expiredListingIds: [] };
  }

  const ids = expiredCandidates.map((c) => c.id);

  // Transition status to expired
  await db
    .update(foodListings)
    .set({
      status: "expired",
      updatedAt: now,
    })
    .where(inArray(foodListings.id, ids));

  // Dispatch notifications & emails to donors
  for (const listing of expiredCandidates) {
    try {
      const [donor] = await db
        .select({
          displayName: users.displayName,
          organisationName: users.organisationName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, listing.donorId))
        .limit(1);

      const donorName =
        donor?.organisationName || donor?.displayName || "Donor Partner";

      const emailData = generateListingExpiredEmail({
        donorName,
        listingTitle: listing.title,
        portions: listing.remainingPortions,
        expiredAt: listing.pickupBy.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
        }),
      });

      await createNotification({
        userId: listing.donorId,
        type: "listing_expired",
        title: "Food Listing Expired",
        message: `Your listing "${listing.title}" reached its pickup deadline and was closed to maintain food safety.`,
        link: "/dashboard/donor",
        channel: "both",
        emailSubject: emailData.subject,
        emailHtml: emailData.html,
        recipientEmail: donor?.email || undefined,
      });
    } catch (err) {
      console.warn(
        `[processListingExpiry] Failed notifying donor for listing ${listing.id}:`,
        err
      );
    }
  }

  return {
    expiredCount: ids.length,
    expiredListingIds: ids,
  };
}

/**
 * Checks for upcoming pickup deadlines (within 45 minutes) and notifies volunteers.
 */
export async function processVolunteerReminders(): Promise<{
  remindedCount: number;
  orderIds: string[];
}> {
  const now = new Date();
  const windowLimit = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutes

  // Find orders nearing deadline with assigned volunteer
  const upcomingOrders = await db
    .select({
      orderId: rescueOrders.id,
      volunteerId: rescueOrders.volunteerId,
      pickupDeadline: rescueOrders.pickupDeadline,
      portions: rescueOrders.allocatedPortions,
      listingId: rescueOrders.listingId,
      receiverId: rescueOrders.receiverId,
    })
    .from(rescueOrders)
    .where(
      and(
        inArray(rescueOrders.status, ["pending", "accepted"]),
        gte(rescueOrders.pickupDeadline, now),
        lte(rescueOrders.pickupDeadline, windowLimit)
      )
    );

  const remindedIds: string[] = [];

  for (const order of upcomingOrders) {
    if (!order.volunteerId) continue;

    try {
      // Fetch details for email
      const [listing] = await db
        .select({
          title: foodListings.title,
          locationName: foodListings.locationName,
          donorId: foodListings.donorId,
        })
        .from(foodListings)
        .where(eq(foodListings.id, order.listingId))
        .limit(1);

      const [volunteer] = await db
        .select({
          displayName: users.displayName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, order.volunteerId))
        .limit(1);

      const [donor] = listing
        ? await db
            .select({
              organisationName: users.organisationName,
              displayName: users.displayName,
            })
            .from(users)
            .where(eq(users.id, listing.donorId))
            .limit(1)
        : [null];

      const [receiver] = await db
        .select({
          organisationName: users.organisationName,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.id, order.receiverId))
        .limit(1);

      const volunteerName = volunteer?.displayName || "Rescue Courier";
      const donorName = donor?.organisationName || donor?.displayName || "Donor Partner";
      const receiverName = receiver?.organisationName || receiver?.displayName || "Receiver Partner";

      const emailData = generateVolunteerReminderEmail({
        volunteerName,
        listingTitle: listing?.title || "Food Rescue Assignment",
        donorName,
        donorAddress: listing?.locationName || "Pickup Location",
        receiverName,
        receiverAddress: "Dropoff Destination",
        portions: order.portions,
        pickupDeadline: order.pickupDeadline.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        orderId: order.orderId,
      });

      await createNotification({
        userId: order.volunteerId,
        type: "volunteer_reminder",
        title: "Pickup Window Approaching",
        message: `Pickup for "${listing?.title || "Food Rescue"}" is due by ${order.pickupDeadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        link: "/dashboard/volunteer",
        channel: "both",
        emailSubject: emailData.subject,
        emailHtml: emailData.html,
        recipientEmail: volunteer?.email || undefined,
      });

      remindedIds.push(order.orderId);
    } catch (err) {
      console.warn(
        `[processVolunteerReminders] Failed sending reminder for order ${order.orderId}:`,
        err
      );
    }
  }

  return {
    remindedCount: remindedIds.length,
    orderIds: remindedIds,
  };
}
