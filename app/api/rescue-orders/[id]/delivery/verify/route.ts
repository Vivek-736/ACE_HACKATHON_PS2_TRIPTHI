import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { rescueOrders, deliveryEvents } from "@/db/schema/orders";
import { foodListings } from "@/db/schema/listings";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { users } from "@/db/schema/users";
import { verifyHandoffOtp } from "@/lib/orders/otp";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createNotification } from "@/lib/notifications/service";
import { generateDeliveryCompletedEmail } from "@/lib/email/templates";

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

    // Phase 6: Notify Donor, Receiver, and Volunteer with verified impact metrics
    try {
      const [listing] = await db
        .select({
          donorId: foodListings.donorId,
          title: foodListings.title,
        })
        .from(foodListings)
        .where(eq(foodListings.id, order.listingId))
        .limit(1);

      const [donorUser] = listing
        ? await db
            .select({
              displayName: users.displayName,
              organisationName: users.organisationName,
              email: users.email,
            })
            .from(users)
            .where(eq(users.id, listing.donorId))
            .limit(1)
        : [null];

      const [receiverUser] = await db
        .select({
          displayName: users.displayName,
          organisationName: users.organisationName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, order.receiverId))
        .limit(1);

      const donorName =
        donorUser?.organisationName || donorUser?.displayName || "Donor Partner";
      const receiverName =
        receiverUser?.organisationName || receiverUser?.displayName || "Community Receiver";

      // Impact assumptions: 1 portion = 1 meal; 1 portion ≈ 0.4 kg food = 1.0 kg CO2e avoided from landfill
      const mealsSaved = order.allocatedPortions;
      const co2eAvoided = Number((order.allocatedPortions * 0.4 * 2.5).toFixed(1));

      // Donor email & notification
      if (listing && donorUser) {
        const donorEmail = generateDeliveryCompletedEmail({
          recipientName: donorName,
          isDonor: true,
          listingTitle: listing.title,
          portions: order.allocatedPortions,
          mealsSaved,
          co2eKgAvoided: co2eAvoided,
          receiverName,
          donorName,
          orderId: order.id,
        });

        createNotification({
          userId: listing.donorId,
          type: "food_delivered",
          title: "Surplus Food Delivered! 🎯",
          message: `Your donation of "${listing.title}" reached ${receiverName}. You saved ${mealsSaved} meals and avoided ~${co2eAvoided} kg CO₂e!`,
          link: "/dashboard/donor",
          channel: "both",
          emailSubject: donorEmail.subject,
          emailHtml: donorEmail.html,
          recipientEmail: donorUser.email || undefined,
        }).catch((e) => console.warn("Failed notifying donor of delivery:", e));
      }

      // Receiver email & notification
      if (receiverUser) {
        const receiverEmail = generateDeliveryCompletedEmail({
          recipientName: receiverName,
          isDonor: false,
          listingTitle: listing?.title || "Food Rescue",
          portions: order.allocatedPortions,
          mealsSaved,
          co2eKgAvoided: co2eAvoided,
          receiverName,
          donorName,
          orderId: order.id,
        });

        createNotification({
          userId: order.receiverId,
          type: "food_delivered",
          title: "Food Delivery Received! 🍲",
          message: `Verified delivery of ${order.allocatedPortions} portions of "${listing?.title || "Food Rescue"}" from ${donorName}.`,
          link: "/dashboard/receiver",
          channel: "both",
          emailSubject: receiverEmail.subject,
          emailHtml: receiverEmail.html,
          recipientEmail: receiverUser.email || undefined,
        }).catch((e) => console.warn("Failed notifying receiver of delivery:", e));
      }

      // Volunteer notification: +50 Rescue Credits
      if (order.volunteerId) {
        createNotification({
          userId: order.volunteerId,
          type: "food_delivered",
          title: "Mission Complete! +50 Credits 🌟",
          message: `You delivered ${order.allocatedPortions} portions safely to ${receiverName}. 50 Rescue Credits added to your profile!`,
          link: "/dashboard/volunteer",
          channel: "in_app",
        }).catch((e) => console.warn("Failed notifying volunteer of completed delivery:", e));
      }
    } catch (notifErr) {
      console.warn("[POST delivery verify] Notification warning:", notifErr);
    }

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
