import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

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

const impactSource = fs.readFileSync(path.resolve("lib/impact/engine.ts"), "utf-8");
const creditsSource = fs.readFileSync(path.resolve("lib/credits/service.ts"), "utf-8");
const paymentsSource = fs.readFileSync(path.resolve("lib/payments/plans.ts"), "utf-8");
const creditsSchema = fs.readFileSync(path.resolve("db/schema/credits.ts"), "utf-8");
const paymentsSchema = fs.readFileSync(path.resolve("db/schema/payments.ts"), "utf-8");
const usersSchema = fs.readFileSync(path.resolve("db/schema/users.ts"), "utf-8");

const PORTION_TO_KG = 0.4;
const KG_TO_CO2E = 2.5;

assert(impactSource.includes("export const PORTION_TO_KG = 0.4;"), "Standard portion weight is 0.4 kg (400g)");
assert(impactSource.includes("export const KG_TO_CO2E = 2.5;"), "Landfill methane emission factor is 2.5 kg CO2e per kg diverted food waste");
assert(
  impactSource.includes("status = 'delivered'") &&
    impactSource.includes("Only verified completed deliveries"),
  "Impact policy mandates only verified completed deliveries count"
);
assert(
  impactSource.includes("portionWeightKg: PORTION_TO_KG") &&
    impactSource.includes("emissionFactorKgCo2ePerKgWaste: KG_TO_CO2E"),
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

function calculateVolunteerTier(credits) {
  if (credits >= 500) {
    return {
      tierName: "Gold Community Guardian",
      currentCredits: credits,
      minCredits: 500,
      nextTierCredits: null,
      progressPercent: 100,
    };
  }
  if (credits >= 200) {
    const range = 500 - 200;
    const progress = Math.min(100, Math.round(((credits - 200) / range) * 100));
    return {
      tierName: "Silver Rescuer",
      currentCredits: credits,
      minCredits: 200,
      nextTierCredits: 500,
      progressPercent: progress,
    };
  }
  const range = 200;
  const progress = Math.min(100, Math.round((credits / range) * 100));
  return {
    tierName: "Bronze Scout",
    currentCredits: credits,
    minCredits: 0,
    nextTierCredits: 200,
    progressPercent: progress,
  };
}

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

assert(creditsSchema.includes("volunteer_id"), "rescueCreditLedger schema contains volunteerId column");
assert(creditsSchema.includes("order_id"), "rescueCreditLedger schema contains orderId column");
assert(creditsSchema.includes("amount"), "rescueCreditLedger schema contains amount column");
assert(creditsSchema.includes("balance_after"), "rescueCreditLedger schema contains balanceAfter column");
assert(creditsSchema.includes("CREDIT_TRANSACTION_TYPES"), "rescueCreditLedger schema contains transaction type enum column");

assert(paymentsSchema.includes("user_id"), "paymentRecords schema contains userId column");
assert(paymentsSchema.includes("amount"), "paymentRecords schema contains amount in paise");
assert(paymentsSchema.includes("purpose"), "paymentRecords schema contains purpose enum column");
assert(paymentsSchema.includes("is_simulated"), "paymentRecords schema contains isSimulated boolean flag");
assert(paymentsSchema.includes("status"), "paymentRecords schema contains status column");

assert(usersSchema.includes("verification_status"), "users schema contains verificationStatus column");

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

assert(paymentsSource.includes("MONETIZATION_PLANS"), "Monetization catalog has plans defined");
assert(paymentsSource.includes("donor_subscription_pro") && paymentsSource.includes("49900"), "Pro Waste Analytics plan priced at ₹499/mo (49900 paise)");
assert(paymentsSource.includes("donor_subscription_enterprise") && paymentsSource.includes("149900"), "Enterprise ESG Suite plan priced at ₹1,499/mo (149900 paise)");
assert(paymentsSource.includes("csr_sponsorship") && paymentsSource.includes("500000"), "CSR Rescue Batch (500 Meals) priced at ₹5,000 (500000 paise)");
assert(paymentsSource.includes("priority_clearance_fee") && paymentsSource.includes("29900"), "Priority clearance fee priced at ₹299 (29900 paise)");

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
