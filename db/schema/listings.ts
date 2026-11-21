import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const FOOD_CATEGORIES = [
  "cooked_meals",
  "bakery",
  "produce",
  "packaged_groceries",
  "dairy",
  "beverages",
  "other",
] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const DIET_TYPES = [
  "vegetarian",
  "vegan",
  "non_vegetarian",
  "halal",
  "jain",
  "eggetarian",
] as const;
export type DietType = (typeof DIET_TYPES)[number];

export const STORAGE_INSTRUCTIONS = [
  "room_temperature",
  "refrigerated",
  "frozen",
  "hot_holding",
] as const;
export type StorageInstruction = (typeof STORAGE_INSTRUCTIONS)[number];

export const LISTING_STATUSES = [
  "available",
  "reserved",
  "in_rescue",
  "completed",
  "cancelled",
  "expired",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const foodListings = pgTable("food_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  donorId: uuid("donor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organisationName: text("organisation_name"),
  title: text("title").notNull(),
  foodCategory: text("food_category", { enum: FOOD_CATEGORIES }).notNull(),
  dietType: text("diet_type", { enum: DIET_TYPES }).notNull(),
  quantityPortions: integer("quantity_portions").notNull(),
  remainingPortions: integer("remaining_portions").notNull(),
  weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
  preparedAt: timestamp("prepared_at", { withTimezone: true }).notNull(),
  pickupBy: timestamp("pickup_by", { withTimezone: true }).notNull(),
  storageInstructions: text("storage_instructions", {
    enum: STORAGE_INSTRUCTIONS,
  }).notNull(),
  allergenInfo: text("allergen_info").notNull(), // e.g. "none" or "dairy, gluten, nuts"
  handlingNotes: text("handling_notes"),
  locationName: text("location_name").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  status: text("status", { enum: LISTING_STATUSES })
    .notNull()
    .default("available"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FoodListing = typeof foodListings.$inferSelect;
export type NewFoodListing = typeof foodListings.$inferInsert;
