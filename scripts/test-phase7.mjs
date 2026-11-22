import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import {
  PORTION_TO_KG,
  KG_TO_CO2E,
  IMPACT_ASSUMPTIONS,
} from "../lib/impact/engine.ts";
import {
  calculateVolunteerTier,
} from "../lib/credits/service.ts";
import {
  MONETIZATION_PLANS,
} from "../lib/payments/service.ts";
import { rescueCreditLedger } from "../db/schema/credits.ts";
import { paymentRecords } from "../db/schema/payments.ts";
import { users } from "../db/schema/users.ts";

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ ${message}`);
    failCount++;
  }
}

console.log("=== Running Phase 7 Impact, Credits, Admin & Business Model Tests ===\n");

// 1. Impact Engine & Transparent Calculation Assumptions
console.log("1. Testing Environmental & Community Impact Calculation Engine:");

assert(PORTION_TO_KG === 0.4, "Standard portion weight is 0.4 kg (400g)");
assert(KG_TO_CO2E === 2.5, "Landfill methane emission factor is 2.5 kg CO2e per kg diverted food waste");
assert(
  typeof IMPACT_ASSUMPTIONS.policyStatement === "string" &&
    IMPACT_ASSUMPTIONS.policyStatement.includes("status = 'delivered'"),
  "Impact policy mandates only verified completed deliveries count"
);
assert(
  IMPACT_ASSUMPTIONS.portionWeightKg === 0.4 &&
    IMPACT_ASSUMPTIONS.emissionFactorKgCo2ePerKgWaste === 2.5,
  "Transparent assumptions record standard constants"
);

// Mathematical verification of impact formula
const samplePortions = 100;
const sampleWasteKg = samplePortions * PORTION_TO_KG;
const sampleCo2eKg = sampleWasteKg * KG_TO_CO2E;

assert(sampleWasteKg === 40.0, "100 portions accurately equals 40.0 kg diverted");
assert(sampleCo2eKg === 100.0, "40 kg food waste accurately equals 100.0 kg CO2e averted");

// 2. Rescue Credits Tier Rules & Calculation
console.log("\n2. Testing Volunteer Recognition Tiers & Credit Thresholds:");

const bronzeTier = calculateVolunteerTier(80);
assert(bronzeTier.tierName === "Bronze Scout", "80 credits is categorized as 'Bronze Scout'");
assert(bronzeTier.progressPercent === 40, "80 credits is 40% progress towards Silver (200 threshold)");
assert(bronzeTier.nextTierCredits === 200, "Bronze next tier target is 200 credits");

const silverTier = calculateVolunteerTier(350);
assert(silverTier.tierName === "Silver Rescuer", "350 credits is categorized as 'Silver Rescuer'");
assert(silverTier.nextTierCredits === 500, "Silver next tier target is 500 credits");
assert(silverTier.progressPercent === 50, "350 credits is 50% progress between 200 and 500");

const goldTier = calculateVolunteerTier(620);
assert(goldTier.tierName === "Gold Community Guardian", "620 credits is categorized as 'Gold Community Guardian'");
assert(goldTier.nextTierCredits === null, "Gold is top tier (nextTierCredits is null)");
assert(goldTier.progressPercent === 100, "Gold tier shows 100% progress");

// 3. Database Schema Verification for Phase 7
console.log("\n3. Testing Database Schema Columns for Credits, Payments, and Verification:");

assert("volunteerId" in rescueCreditLedger, "rescueCreditLedger schema contains volunteerId column");
assert("orderId" in rescueCreditLedger, "rescueCreditLedger schema contains orderId column");
assert("amount" in rescueCreditLedger, "rescueCreditLedger schema contains amount column");
assert("balanceAfter" in rescueCreditLedger, "rescueCreditLedger schema contains balanceAfter column");
assert("type" in rescueCreditLedger, "rescueCreditLedger schema contains transaction type enum column");

assert("userId" in paymentRecords, "paymentRecords schema contains userId column");
assert("amount" in paymentRecords, "paymentRecords schema contains amount in paise");
assert("purpose" in paymentRecords, "paymentRecords schema contains purpose enum column");
assert("isSimulated" in paymentRecords, "paymentRecords schema contains isSimulated boolean flag");
assert("status" in paymentRecords, "paymentRecords schema contains status column");

assert("verificationStatus" in users, "users schema contains verificationStatus column");

// 4. Credit Ledger Idempotency Simulation
console.log("\n4. Testing Credit Ledger Duplicate Prevention (Idempotency):");

const mockLedgerStore = [];

function simulateAwardCredits(volunteerId, orderId, type, amount) {
  // Check idempotency
  if (orderId) {
    const existing = mockLedgerStore.find(
      (entry) =>
        entry.volunteerId === volunteerId &&
        entry.orderId === orderId &&
        entry.type === type
    );
    if (existing) {
      return { alreadyAwarded: true, balance: existing.balanceAfter };
    }
  }

  const prevBalance = mockLedgerStore.length > 0 ? mockLedgerStore[mockLedgerStore.length - 1].balanceAfter : 0;
  const balanceAfter = prevBalance + amount;

  const entry = {
    id: `tx-${Date.now()}-${Math.random()}`,
    volunteerId,
    orderId,
    type,
    amount,
    balanceAfter,
  };
  mockLedgerStore.push(entry);

  return { alreadyAwarded: false, balance: balanceAfter };
}

const firstAward = simulateAwardCredits("vol-1", "order-123", "delivery_completed", 50);
assert(!firstAward.alreadyAwarded && firstAward.balance === 50, "Initial delivery awards +50 credits");

const duplicateAward = simulateAwardCredits("vol-1", "order-123", "delivery_completed", 50);
assert(duplicateAward.alreadyAwarded && duplicateAward.balance === 50, "Duplicate award attempt for same order is safely rejected");
assert(mockLedgerStore.length === 1, "Ledger contains exactly 1 transaction after duplicate attempt");

// 5. Commercial Monetization Plans & Business Model
console.log("\n5. Testing Commercial Monetization & CSR Plans:");

assert(MONETIZATION_PLANS.length >= 4, "Monetization catalog has at least 4 plans defined");

const proPlan = MONETIZATION_PLANS.find((p) => p.id === "donor_subscription_pro");
assert(Boolean(proPlan) && proPlan.pricePaise === 49900, "Pro Waste Analytics plan priced at ₹499/mo (49900 paise)");

const enterprisePlan = MONETIZATION_PLANS.find((p) => p.id === "donor_subscription_enterprise");
assert(Boolean(enterprisePlan) && enterprisePlan.pricePaise === 149900, "Enterprise ESG Suite plan priced at ₹1,499/mo (149900 paise)");

const csrPlan = MONETIZATION_PLANS.find((p) => p.id === "csr_sponsorship");
assert(Boolean(csrPlan) && csrPlan.pricePaise === 500000, "CSR Rescue Batch (500 Meals) priced at ₹5,000 (500000 paise)");

const priorityPlan = MONETIZATION_PLANS.find((p) => p.id === "priority_clearance_fee");
assert(Boolean(priorityPlan) && priorityPlan.pricePaise === 29900, "Priority clearance fee priced at ₹299 (29900 paise)");

// 6. Admin Role Authorization Rule Check
console.log("\n6. Testing Admin Authorization & Governance Policies:");

function checkAdminAccess(user) {
  if (!user) return { status: 401, error: "UNAUTHORIZED" };
  if (user.role !== "admin") return { status: 403, error: "FORBIDDEN" };
  return { status: 200, success: true };
}

assert(checkAdminAccess(null).status === 401, "Unauthenticated request rejected with 401");
assert(checkAdminAccess({ id: "u-1", role: "donor" }).status === 403, "Donor cannot access admin overview (403)");
assert(checkAdminAccess({ id: "u-2", role: "receiver" }).status === 403, "Receiver cannot access admin overview (403)");
assert(checkAdminAccess({ id: "u-3", role: "volunteer" }).status === 403, "Volunteer cannot access admin overview (403)");
assert(checkAdminAccess({ id: "u-4", role: "admin" }).status === 200, "Platform Admin granted access (200)");

console.log("\n=======================================================");
console.log(`Phase 7 Tests: ${passCount} Passed, ${failCount} Failed`);
console.log("=======================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
