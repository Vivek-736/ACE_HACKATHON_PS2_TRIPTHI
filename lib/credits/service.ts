import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  rescueCreditLedger,
  CreditTransactionType,
} from "@/db/schema/credits";
import { volunteerProfiles } from "@/db/schema/volunteers";

export interface VolunteerTierInfo {
  tierName: "Bronze Scout" | "Silver Rescuer" | "Gold Community Guardian";
  currentCredits: number;
  minCredits: number;
  nextTierCredits: number | null;
  progressPercent: number;
  badgeColorClass: string;
}

export function calculateVolunteerTier(credits: number): VolunteerTierInfo {
  if (credits >= 500) {
    return {
      tierName: "Gold Community Guardian",
      currentCredits: credits,
      minCredits: 500,
      nextTierCredits: null,
      progressPercent: 100,
      badgeColorClass: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    };
  }

  if (credits >= 200) {
    return {
      tierName: "Silver Rescuer",
      currentCredits: credits,
      minCredits: 200,
      nextTierCredits: 500,
      progressPercent: Math.min(100, Math.round(((credits - 200) / 300) * 100)),
      badgeColorClass: "bg-slate-400/15 text-slate-600 border-slate-400/30",
    };
  }

  return {
    tierName: "Bronze Scout",
    currentCredits: credits,
    minCredits: 0,
    nextTierCredits: 200,
    progressPercent: Math.min(100, Math.round((credits / 200) * 100)),
    badgeColorClass: "bg-amber-700/15 text-amber-700 border-amber-700/30",
  };
}

export async function awardVolunteerCredits(params: {
  volunteerUserId: string;
  orderId?: string;
  type: CreditTransactionType;
  amount: number;
  description: string;
}) {
  const { volunteerUserId, orderId, type, amount, description } = params;

  // 1. Idempotency check: If linked to an order, verify if already awarded
  if (orderId) {
    const existing = await db
      .select()
      .from(rescueCreditLedger)
      .where(
        and(
          eq(rescueCreditLedger.volunteerId, volunteerUserId),
          eq(rescueCreditLedger.orderId, orderId),
          eq(rescueCreditLedger.type, type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `[Rescue Credits] Skipping duplicate award for volunteer ${volunteerUserId}, order ${orderId}, type ${type}`
      );
      return {
        alreadyAwarded: true,
        transaction: existing[0],
      };
    }
  }

  // 2. Fetch current profile balance
  const [profile] = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.userId, volunteerUserId))
    .limit(1);

  const currentBalance = profile?.rescueCredits || 0;
  const balanceAfter = currentBalance + amount;

  // 3. Insert transaction into ledger
  const [transaction] = await db
    .insert(rescueCreditLedger)
    .values({
      volunteerId: volunteerUserId,
      orderId: orderId || null,
      amount,
      type,
      description,
      balanceAfter,
    })
    .returning();

  // 4. Update profile balance atomically
  if (profile) {
    await db
      .update(volunteerProfiles)
      .set({
        rescueCredits: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(volunteerProfiles.userId, volunteerUserId));
  }

  return {
    alreadyAwarded: false,
    transaction,
    newBalance: balanceAfter,
  };
}

export async function getVolunteerCreditStatement(volunteerUserId: string) {
  const [profile] = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.userId, volunteerUserId))
    .limit(1);

  const credits = profile?.rescueCredits || 0;
  const tier = calculateVolunteerTier(credits);

  const transactions = await db
    .select()
    .from(rescueCreditLedger)
    .where(eq(rescueCreditLedger.volunteerId, volunteerUserId))
    .orderBy(desc(rescueCreditLedger.createdAt))
    .limit(50);

  return {
    totalCredits: credits,
    tier,
    totalDeliveries: profile?.totalDeliveries || 0,
    onTimeRate: profile?.onTimeRate || "100.00",
    transactions,
  };
}
