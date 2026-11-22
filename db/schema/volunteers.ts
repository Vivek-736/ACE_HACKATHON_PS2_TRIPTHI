import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const VOLUNTEER_AVAILABILITY = [
  "available",
  "busy",
  "offline",
] as const;
export type VolunteerAvailability = (typeof VOLUNTEER_AVAILABILITY)[number];

export const TRANSPORT_MODES = [
  "bicycle",
  "motorcycle",
  "car",
  "delivery_truck",
  "on_foot",
] as const;
export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const volunteerProfiles = pgTable("volunteer_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  availabilityStatus: text("availability_status")
    .notNull()
    .default("available"),
  preferredRadiusKm: integer("preferred_radius_km").notNull().default(10),
  transportMode: text("transport_mode").notNull().default("motorcycle"),
  locationName: text("location_name")
    .notNull()
    .default("Cyber Pearl, Madhapur"),
  latitude: numeric("latitude", { precision: 10, scale: 6 })
    .notNull()
    .default("17.4483"),
  longitude: numeric("longitude", { precision: 10, scale: 6 })
    .notNull()
    .default("78.3815"),
  rescueCredits: integer("rescue_credits").notNull().default(0),
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  onTimeRate: numeric("on_time_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("100.00"),
  locationUpdatedAt: timestamp("location_updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type VolunteerProfile = typeof volunteerProfiles.$inferSelect;
export type NewVolunteerProfile = typeof volunteerProfiles.$inferInsert;
