import { NextRequest } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { foodListings } from "@/db/schema/listings";
import { rescueOrders } from "@/db/schema/orders";
import { paymentRecords } from "@/db/schema/payments";
import { calculateImpactSummary } from "@/lib/impact/engine";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Access denied. Platform Admin authorization required.",
        403
      );
    }

    // 1. Fetch user counts by role
    const allUsers = await db.select().from(users);
    const usersByRole = {
      total: allUsers.length,
      donors: allUsers.filter((u) => u.role === "donor").length,
      receivers: allUsers.filter((u) => u.role === "receiver").length,
      volunteers: allUsers.filter((u) => u.role === "volunteer").length,
      admins: allUsers.filter((u) => u.role === "admin").length,
      unverifiedOrgs: allUsers.filter(
        (u) =>
          (u.role === "donor" || u.role === "receiver") &&
          u.verificationStatus !== "verified"
      ).length,
    };

    // 2. Fetch listings and orders counts
    const allListings = await db.select().from(foodListings);
    const activeListings = allListings.filter((l) => l.status === "available").length;

    const allOrders = await db.select().from(rescueOrders);
    const ordersByStatus = {
      total: allOrders.length,
      pending: allOrders.filter((o) => o.status === "pending").length,
      inTransit: allOrders.filter((o) =>
        ["accepted", "at_pickup", "collected", "at_receiver"].includes(o.status)
      ).length,
      delivered: allOrders.filter((o) => o.status === "delivered").length,
      cancelled: allOrders.filter((o) => o.status === "cancelled").length,
    };

    // 3. Payment revenue & CSR fund counts
    const payments = await db.select().from(paymentRecords);
    const paidPayments = payments.filter((p) => p.status === "paid");
    const totalRevenuePaise = paidPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // 4. Global impact summary
    const impact = await calculateImpactSummary();

    return apiSuccess({
      usersByRole,
      listings: {
        total: allListings.length,
        active: activeListings,
        completed: allListings.filter((l) => l.status === "completed").length,
        expired: allListings.filter((l) => l.status === "expired").length,
      },
      ordersByStatus,
      financials: {
        totalRevenueRupees: (totalRevenuePaise / 100).toFixed(2),
        totalTransactions: payments.length,
        paidTransactions: paidPayments.length,
      },
      impact,
    });
  } catch (err) {
    console.error("Failed to load admin overview:", err);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while loading admin overview",
      500
    );
  }
}
