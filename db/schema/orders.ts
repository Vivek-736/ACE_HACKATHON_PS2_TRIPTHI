import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { foodListings } from "./listings";

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "at_pickup",
  "collected",
  "at_receiver",
  "delivered",
  "declined",
  "cancelled",
  "failed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const EVENT_TYPES = [
  "order_created",
  "assignment_offered",
  "assignment_accepted",
  "assignment_declined",
  "arrived_at_pickup",
  "food_collected",
  "arrived_at_receiver",
  "food_delivered",
  "order_cancelled",
  "order_reassigned",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const ACTOR_ROLES = [
  "donor",
  "receiver",
  "volunteer",
  "admin",
  "system",
] as const;
export type ActorRole = (typeof ACTOR_ROLES)[number];

export const rescueOrders = pgTable("rescue_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => foodListings.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  volunteerId: uuid("volunteer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  allocatedPortions: integer("allocated_portions").notNull(),
  status: text("status", { enum: ORDER_STATUSES }).notNull().default("pending"),
  pickupOtp: text("pickup_otp").notNull(),
  deliveryOtp: text("delivery_otp").notNull(),
  pickupOtpConsumed: boolean("pickup_otp_consumed").notNull().default(false),
  deliveryOtpConsumed: boolean("delivery_otp_consumed").notNull().default(false),
  pickupAttempts: integer("pickup_attempts").notNull().default(0),
  deliveryAttempts: integer("delivery_attempts").notNull().default(0),
  pickupDeadline: timestamp("pickup_deadline", { withTimezone: true }).notNull(),
  collectedAt: timestamp("collected_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  cancellationReason: text("cancellation_reason"),
  matchScore: numeric("match_score", { precision: 5, scale: 2 }).default("85.00"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const deliveryEvents = pgTable("delivery_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => rescueOrders.id, { onDelete: "cascade" }),
  eventType: text("event_type", { enum: EVENT_TYPES }).notNull(),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actorRole: text("actor_role", { enum: ACTOR_ROLES }).notNull(),
  notes: text("notes"),
  proofPhotoUrl: text("proof_photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type RescueOrder = typeof rescueOrders.$inferSelect;
export type NewRescueOrder = typeof rescueOrders.$inferInsert;

export type DeliveryEvent = typeof deliveryEvents.$inferSelect;
export type NewDeliveryEvent = typeof deliveryEvents.$inferInsert;
