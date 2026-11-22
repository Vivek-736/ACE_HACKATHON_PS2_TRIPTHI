import { db } from "@/lib/db";
import {
  notifications,
  NotificationType,
  NotificationChannel,
  Notification,
} from "@/db/schema/notifications";
import { users } from "@/db/schema/users";
import { sendEmail } from "@/lib/email/client";
import { eq, and, desc, sql } from "drizzle-orm";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  channel?: NotificationChannel;
  sendEmailNotification?: boolean;
  emailSubject?: string;
  emailHtml?: string;
  recipientEmail?: string;
}

/**
 * Creates an in-app notification and optionally dispatches an email via Nodemailer.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<Notification | null> {
  const {
    userId,
    type,
    title,
    message,
    link,
    channel = "in_app",
    sendEmailNotification = false,
    emailSubject,
    emailHtml,
    recipientEmail,
  } = params;

  try {
    // 1. Persist in-app notification in Neon DB
    const [created] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        link: link ?? null,
        read: false,
        channel: sendEmailNotification || channel === "email" || channel === "both" ? "both" : channel,
      })
      .returning();

    // 2. Dispatch email if requested or channel is email/both
    const shouldSendEmail =
      sendEmailNotification || channel === "email" || channel === "both";

    if (shouldSendEmail) {
      let targetEmail = recipientEmail;

      if (!targetEmail) {
        // Query recipient user to get email
        const [user] = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        targetEmail = user?.email ?? undefined;
      }

      if (targetEmail) {
        sendEmail({
          to: targetEmail,
          subject: emailSubject || `[Tripti] ${title}`,
          html:
            emailHtml ||
            `<div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
              <h2 style="color: #1b4332;">${title}</h2>
              <p>${message}</p>
              ${link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${link}" style="color: #2d6a4f; font-weight: 600;">View in Tripti</a></p>` : ""}
            </div>`,
          text: `${title}\n\n${message}${link ? `\n\nLink: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${link}` : ""}`,
        }).catch((err) => {
          console.warn("[createNotification] Async email dispatch failed:", err?.message || err);
        });
      }
    }

    return created ?? null;
  } catch (error) {
    console.error("[createNotification] Failed to create notification:", error);
    return null;
  }
}

/**
 * Fetch notifications for a user, sorted newest first
 */
export async function getUserNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const limit = options?.limit ?? 30;
  const offset = options?.offset ?? 0;

  try {
    const conditions = [eq(notifications.userId, userId)];
    if (options?.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    const items = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Count unread notifications
    const [unreadResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    const unreadCount = Number(unreadResult?.count || 0);

    return {
      notifications: items,
      unreadCount,
    };
  } catch (error) {
    console.error("[getUserNotifications] Failed to load notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Mark a single notification as read (verifying user ownership)
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });

    return result.length > 0;
  } catch (error) {
    console.error("[markNotificationAsRead] Error:", error);
    return false;
  }
}

/**
 * Mark all notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning({ id: notifications.id });

    return result.length;
  } catch (error) {
    console.error("[markAllNotificationsAsRead] Error:", error);
    return 0;
  }
}
