import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { rescueOrders } from "./orders";

export const CREDIT_TRANSACTION_TYPES = [
  "delivery_completed",
  "on_time_bonus",
  "tier_upgrade",
  "redemption",
  "adjustment",
] as const;

export type CreditTransactionType = (typeof CREDIT_TRANSACTION_TYPES)[number];

// Immutable ledger recording all Rescue Credit awards, bonuses, and point movements
export const rescueCreditLedger = pgTable(
  "rescue_credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    volunteerId: uuid("volunteer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => rescueOrders.id, {
      onDelete: "set null",
    }),
    amount: integer("amount").notNull(), // positive for earned, negative for deducted
    type: text("type", { enum: CREDIT_TRANSACTION_TYPES }).notNull(),
    description: text("description").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("credit_ledger_volunteer_id_idx").on(table.volunteerId),
    index("credit_ledger_order_id_idx").on(table.orderId),
    index("credit_ledger_created_at_idx").on(table.createdAt),
  ]
);

export type RescueCreditTransaction = typeof rescueCreditLedger.$inferSelect;
export type NewRescueCreditTransaction = typeof rescueCreditLedger.$inferInsert;
