import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  paymentRecords,
  PaymentPurpose,
  PaymentRecord,
} from "@/db/schema/payments";
import { users } from "@/db/schema/users";

export type { PaymentPurpose, PaymentRecord };

export interface PlanTier {
  id: PaymentPurpose;
  name: string;
  category: "donor_saas" | "csr_sponsorship" | "priority_fee";
  pricePaise: number;
  priceDisplay: string;
  billingPeriod: string;
  tagline: string;
  features: string[];
  popular?: boolean;
}

export const MONETIZATION_PLANS: PlanTier[] = [
  {
    id: "donor_subscription_pro",
    name: "Pro Waste Analytics",
    category: "donor_saas",
    pricePaise: 49900, // ₹499.00
    priceDisplay: "₹499",
    billingPeriod: "per month",
    tagline: "For restaurants and caterers looking to optimize food preparation",
    popular: true,
    features: [
      "Kitchen overproduction trends by day of week",
      "Prep volume insights to cut food waste at source",
      "Scope 3 environmental diversion metrics",
      "Priority matching for active surplus postings",
      "Standard email & in-app rescue alerts",
    ],
  },
  {
    id: "donor_subscription_enterprise",
    name: "Enterprise ESG Suite",
    category: "donor_saas",
    pricePaise: 149900, // ₹1,499.00
    priceDisplay: "₹1,499",
    billingPeriod: "per month",
    tagline: "For hotels, supermarket chains and multi-location canteens",
    features: [
      "Everything in Pro Analytics",
      "Audit-grade ESG & CSR report exports (PDF & CSV)",
      "Multi-facility surplus dashboard",
      "Dedicated CSR impact footprint certificate",
      "Custom carbon emissions avoided audit trail",
    ],
  },
  {
    id: "csr_sponsorship",
    name: "CSR Rescue Batch (500 Meals)",
    category: "csr_sponsorship",
    pricePaise: 500000, // ₹5,000.00
    priceDisplay: "₹5,000",
    billingPeriod: "per batch sponsorship",
    tagline: "Corporate sponsors funding volunteer fuel, transport & packing",
    features: [
      "Directly funds logistics for 500 rescued meals",
      "Subsidizes volunteer travel allowances",
      "Co-branded impact plaque on receiver acknowledgements",
      "Tax-ready CSR expenditure certification",
      "Transparent audit of receiver shelters supported",
    ],
  },
  {
    id: "priority_clearance_fee",
    name: "Priority 30-Min Clearance",
    category: "priority_fee",
    pricePaise: 29900, // ₹299.00
    priceDisplay: "₹299",
    billingPeriod: "one-time per event",
    tagline: "For weddings and banquets with strict venue handover deadlines",
    features: [
      "Instant priority push to top-rated nearby couriers",
      "Guaranteed courier dispatch within 30 minutes",
      "Dedicated rescue monitor oversight",
      "Fast-track receiver shelter handoff",
    ],
  },
];

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
