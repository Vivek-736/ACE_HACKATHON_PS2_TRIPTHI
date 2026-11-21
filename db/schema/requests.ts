import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { foodListings } from "./listings";

export const REQUEST_STATUSES = [
  "active",
  "matched",
  "fulfilled",
  "cancelled",
  "expired",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

// Food requests created by receivers stating what surplus food they need
export const foodRequests = pgTable("food_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organisationName: text("organisation_name"),
  title: text("title").notNull(),
  requestedPortions: integer("requested_portions").notNull(),
  foodPreferences: text("food_preferences").notNull(), // categories / diet preferences
  dietaryConstraints: text("dietary_constraints"),
  neededBy: timestamp("needed_by", { withTimezone: true }).notNull(),
  preferredRadiusKm: integer("preferred_radius_km").notNull().default(10),
  locationName: text("location_name").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  status: text("status", { enum: REQUEST_STATUSES })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Reservation / request intent placed by a receiver against an existing food listing
export const listingReservations = pgTable("listing_reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => foodListings.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  portionsReserved: integer("portions_reserved").notNull(),
  notes: text("notes"),
  status: text("status", { enum: RESERVATION_STATUSES })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Receiver organisation profile: capacity and dietary constraints
export const receiverProfiles = pgTable("receiver_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyCapacityPortions: integer("daily_capacity_portions")
    .notNull()
    .default(100),
  currentCapacityPortions: integer("current_capacity_portions")
    .notNull()
    .default(100),
  dietaryPreferences: text("dietary_preferences"),
  serviceRadiusKm: integer("service_radius_km").notNull().default(10),
  operatingHours: text("operating_hours"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FoodRequest = typeof foodRequests.$inferSelect;
export type NewFoodRequest = typeof foodRequests.$inferInsert;

export type ListingReservation = typeof listingReservations.$inferSelect;
export type NewListingReservation = typeof listingReservations.$inferInsert;

export type ReceiverProfile = typeof receiverProfiles.$inferSelect;
export type NewReceiverProfile = typeof receiverProfiles.$inferInsert;
