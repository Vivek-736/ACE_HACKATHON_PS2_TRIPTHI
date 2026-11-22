import { eq, desc, and, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  paymentRecords,
  PaymentPurpose,
  PaymentRecord,
} from "@/db/schema/payments";
import { users } from "@/db/schema/users";
import { MONETIZATION_PLANS, PlanTier } from "./plans";

export * from "./plans";
export type { PaymentPurpose, PaymentRecord };

export async function createCheckoutSession(params: {
  userId: string;
  purpose: PaymentPurpose;
  organisationName?: string;
  notes?: string;
}) {
  const { userId, purpose, organisationName, notes } = params;

  const plan = MONETIZATION_PLANS.find((p) => p.id === purpose);
  if (!plan) {
    throw new Error(`Unknown plan purpose: ${purpose}`);
  }

  // Check if Razorpay credentials exist
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const isRealRazorpay = Boolean(
    keyId &&
      keySecret &&
      !keyId.includes("placeholder") &&
      keyId.startsWith("rzp_")
  );

  let razorpayOrderId = `sim_ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  if (isRealRazorpay) {
    try {
      // Basic auth fetch to Razorpay API without heavy SDK dependency
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.pricePaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            userId,
            purpose,
            planName: plan.name,
          },
        }),
      });

      if (rzpRes.ok) {
        const rzpData = await rzpRes.json();
        razorpayOrderId = rzpData.id;
      }
    } catch (err) {
      console.warn("Razorpay live order creation failed, falling back to simulation:", err);
    }
  }

  // Record payment order in database
  const [record] = await db
    .insert(paymentRecords)
    .values({
      userId,
      organisationName: organisationName || null,
      amount: plan.pricePaise,
      currency: "INR",
      purpose,
      planName: plan.name,
      status: "created",
      isSimulated: !isRealRazorpay,
      razorpayOrderId,
      notes: notes || `Checkout for ${plan.name}`,
    })
    .returning();

  return {
    paymentRecordId: record.id,
    amount: plan.pricePaise,
    currency: "INR",
    planName: plan.name,
    razorpayOrderId,
    isSimulated: !isRealRazorpay,
    razorpayKeyId: isRealRazorpay ? keyId : "rzp_test_simulated_key",
  };
}

export async function confirmPayment(params: {
  paymentRecordId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}) {
  const { paymentRecordId, razorpayPaymentId } = params;

  const [record] = await db
    .select()
    .from(paymentRecords)
    .where(eq(paymentRecords.id, paymentRecordId))
    .limit(1);

  if (!record) {
    throw new Error("Payment record not found");
  }

  // Mark as paid
  const [updated] = await db
    .update(paymentRecords)
    .set({
      status: "paid",
      razorpayPaymentId: razorpayPaymentId || `sim_pay_${Date.now()}`,
      updatedAt: new Date(),
    })
    .where(eq(paymentRecords.id, paymentRecordId))
    .returning();

  return updated;
}

export async function getPaymentLedger() {
  return await db
    .select({
      id: paymentRecords.id,
      userId: paymentRecords.userId,
      organisationName: paymentRecords.organisationName,
      amount: paymentRecords.amount,
      currency: paymentRecords.currency,
      purpose: paymentRecords.purpose,
      planName: paymentRecords.planName,
      status: paymentRecords.status,
      isSimulated: paymentRecords.isSimulated,
      createdAt: paymentRecords.createdAt,
    })
    .from(paymentRecords)
    .orderBy(desc(paymentRecords.createdAt))
    .limit(50);
}

/**
 * Checks if a user has an active Pro or Enterprise subscription.
 */
export async function checkUserSubscription(userId: string): Promise<{
  isPro: boolean;
  planName: string | null;
  subscriptionDate: Date | null;
}> {
  try {
    const [activePlan] = await db
      .select({
        planName: paymentRecords.planName,
        createdAt: paymentRecords.createdAt,
      })
      .from(paymentRecords)
      .where(
        and(
          eq(paymentRecords.userId, userId),
          eq(paymentRecords.status, "paid"),
          or(
            eq(paymentRecords.purpose, "donor_subscription_pro"),
            eq(paymentRecords.purpose, "donor_subscription_enterprise")
          )
        )
      )
      .orderBy(desc(paymentRecords.createdAt))
      .limit(1);

    return {
      isPro: Boolean(activePlan),
      planName: activePlan?.planName || null,
      subscriptionDate: activePlan?.createdAt || null,
    };
  } catch (error) {
    console.error("[checkUserSubscription] Error:", error);
    return {
      isPro: false,
      planName: null,
      subscriptionDate: null,
    };
  }
}