import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const PAYMENT_PURPOSES = [
  "donor_subscription_pro",
  "donor_subscription_enterprise",
  "csr_sponsorship",
  "priority_clearance_fee",
] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const PAYMENT_STATUSES = [
  "created",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// Payment records for B2B ESG analytics subscriptions, CSR logistics sponsorships, and timed dispatch fees
export const paymentRecords = pgTable(
  "payment_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organisationName: text("organisation_name"),
    amount: integer("amount").notNull(), // Amount in paise (e.g. 49900 = ₹499.00)
    currency: text("currency").notNull().default("INR"),
    purpose: text("purpose", { enum: PAYMENT_PURPOSES }).notNull(),
    planName: text("plan_name").notNull(),
    status: text("status", { enum: PAYMENT_STATUSES }).notNull().default("created"),
    isSimulated: boolean("is_simulated").notNull().default(true),
    razorpayOrderId: text("razorpay_order_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payment_records_user_id_idx").on(table.userId),
    index("payment_records_status_idx").on(table.status),
    index("payment_records_created_at_idx").on(table.createdAt),
  ]
);

export type PaymentRecord = typeof paymentRecords.$inferSelect;
export type NewPaymentRecord = typeof paymentRecords.$inferInsert;
