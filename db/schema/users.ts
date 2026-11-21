import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const USER_ROLES = [
  "unassigned",
  "donor",
  "receiver",
  "volunteer",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SELECTABLE_ROLES = ["donor", "receiver", "volunteer"] as const;
export type SelectableRole = (typeof SELECTABLE_ROLES)[number];

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  role: text("role", { enum: USER_ROLES }).notNull().default("unassigned"),
  organisationName: text("organisation_name"),
  displayName: text("display_name"),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
