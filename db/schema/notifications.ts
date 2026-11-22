import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const NOTIFICATION_TYPES = [
  "listing_claimed",
  "order_assigned",
  "at_pickup",
  "food_collected",
  "at_receiver",
  "food_delivered",
  "listing_expired",
  "volunteer_reminder",
  "urgent_surplus",
  "system_alert",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = ["in_app", "email", "both"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("system_alert"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    channel: text("channel").notNull().default("in_app"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_created_at_idx").on(table.createdAt),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
