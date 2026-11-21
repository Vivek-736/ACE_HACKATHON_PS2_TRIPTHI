import {
  checkDietaryCompatibility,
  calculateMatchScores,
  rankMatchesForListing,
  DEFAULT_MATCHING_WEIGHTS,
} from "../lib/matching/engine.ts";
import { generateHandoffOtp, verifyHandoffOtp } from "../lib/orders/otp.ts";
import {
  createRescueOrderSchema,
  transitionOrderSchema,
} from "../lib/validations/order.ts";

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

console.log("=== Running Phase 4 Matching Engine & Lifecycle Tests ===\n");

// 1. Dietary Compatibility Tests
console.log("1. Testing Dietary Constraints & Compatibility:");
const vegCheck = checkDietaryCompatibility("vegetarian", "cooked_meals", "Vegetarian, Vegan");
assert(vegCheck.compatible, "Vegetarian food matches vegetarian preference");

const nonVegFailCheck = checkDietaryCompatibility("non_vegetarian", "cooked_meals", "Vegetarian Only");
assert(!nonVegFailCheck.compatible, "Non-vegetarian food is strictly rejected for vegetarian preference");

const veganFailCheck = checkDietaryCompatibility("vegetarian", "cooked_meals", "Strictly Vegan");
assert(!veganFailCheck.compatible, "Dairy/vegetarian food rejected when receiver specifies strictly vegan");

const jainFailCheck = checkDietaryCompatibility("vegetarian", "cooked_meals", "Jain Vegetarian");
assert(!jainFailCheck.compatible, "Non-Jain vegetarian food rejected when receiver requires Jain");

// 2. Score Calculation Tests
console.log("\n2. Testing Deterministic Match Scoring & Explainability:");

const mockListing = {
  id: "listing-1",
  donorId: "donor-1",
  title: "Vegetable Biryani",
  foodCategory: "cooked_meals",
  dietType: "vegetarian",
  quantityPortions: 50,
  remainingPortions: 50,
  preparedAt: new Date(Date.now() - 3600000),
  pickupBy: new Date(Date.now() + 7200000), // 2 hours from now (high urgency)
  storageInstructions: "hot_holding",
  allergenInfo: "dairy",
  locationName: "Cyber Pearl, Madhapur",
  latitude: "17.4483",
  longitude: "78.3815",
  status: "available",
};

const mockReceiver = {
  id: "rec-1",
  organisationName: "Hope Kitchen",
  locationName: "Gachibowli",
  latitude: 17.4156,
  longitude: 78.3428,
  distanceFromDonorKm: 5.5,
  currentCapacity: 60,
  dailyCapacity: 150,
  acceptedDietaryPreferences: "Vegetarian",
  requestedPortions: 50,
};

const mockVolunteer = {
  id: "vol-1",
  displayName: "Ravi Kumar",
  transportMode: "motorcycle",
  locationName: "Hitec City",
  latitude: 17.4504,
  longitude: 78.3808,
  distanceFromDonorKm: 1.2,
  preferredRadiusKm: 10,
  onTimeRate: 98,
  totalDeliveries: 15,
  rescueCredits: 80,
  availabilityStatus: "available",
};

const scores = calculateMatchScores(mockListing, mockReceiver, mockVolunteer, 25);
assert(scores.totalScore > 0 && scores.totalScore <= 100, `Match score is normalized between 0-100 (got ${scores.totalScore})`);
assert(scores.distanceSuitability > 70, `Close distance scores high (${scores.distanceSuitability})`);
assert(scores.urgencySuitability >= 80, `2h pickup window scores high urgency (${scores.urgencySuitability})`);
assert(scores.reliability >= 90, `Reliable volunteer scores high (${scores.reliability})`);
assert(scores.receiverNeedSuitability >= 90, `Exact portion match scores high need fit (${scores.receiverNeedSuitability})`);
assert(scores.creditBonus > 0, `Rescue credits award tie-breaker bonus (+${scores.creditBonus})`);
assert(scores.explanations.length >= 4, "Match score includes explainable breakdown");

// 3. Hard Constraints in Matching Pipeline
console.log("\n3. Testing Hard Constraints in rankMatchesForListing:");

const ranked = rankMatchesForListing(mockListing, [mockReceiver], [mockVolunteer]);
assert(ranked.length === 1 && ranked[0].isEligible, "Candidate passing all constraints is marked eligible");

// Expired listing constraint
const expiredListing = {
  ...mockListing,
  pickupBy: new Date(Date.now() - 60000), // expired 1 min ago
};
const expiredRanked = rankMatchesForListing(expiredListing, [mockReceiver], [mockVolunteer]);
assert(!expiredRanked[0].isEligible, "Expired listing is disqualified");
assert(
  expiredRanked[0].disqualificationReasons.some((r) => r.toLowerCase().includes("deadline")),
  "Disqualification reason explicitly cites deadline"
);

// Zero capacity receiver constraint
const zeroCapReceiver = {
  ...mockReceiver,
  currentCapacity: 2, // too small for 50 portions
};
const capRanked = rankMatchesForListing(mockListing, [zeroCapReceiver], [mockVolunteer]);
assert(!capRanked[0].isEligible, "Receiver with insufficient capacity is disqualified");

// Volunteer outside rescue radius constraint
const farVolunteer = {
  ...mockVolunteer,
  distanceFromDonorKm: 25,
  preferredRadiusKm: 10,
};
const farRanked = rankMatchesForListing(mockListing, [mockReceiver], [farVolunteer]);
assert(farRanked[0].volunteer === null, "Volunteer beyond preferred radius is not assigned to candidate");

// 4. OTP Generation & Verification Tests
console.log("\n4. Testing Secure Handoff OTPs:");
const otp1 = generateHandoffOtp();
const otp2 = generateHandoffOtp();
assert(/^\d{4}$/.test(otp1), `Generated OTP is a 4-digit code (${otp1})`);
assert(verifyHandoffOtp(otp1, otp1), "Matching OTP verifies successfully");
assert(!verifyHandoffOtp("0000", otp1), "Incorrect OTP fails verification");
assert(!verifyHandoffOtp("", otp1), "Empty OTP fails verification");

// 5. Order Schema Validation Tests
console.log("\n5. Testing Order Validation Schemas:");
const validOrderPayload = {
  listingId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  receiverId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6e",
  volunteerId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6f",
  allocatedPortions: 45,
};
const validOrderResult = createRescueOrderSchema.safeParse(validOrderPayload);
assert(validOrderResult.success, "Valid create rescue order payload passes Zod validation");

const zeroPortionOrder = {
  ...validOrderPayload,
  allocatedPortions: 0,
};
assert(!createRescueOrderSchema.safeParse(zeroPortionOrder).success, "Zero portion rescue order is rejected");

// Transition schemas
const validCollectTransition = {
  status: "collected",
  otp: "4829",
  notes: "Collected in thermal crates",
};
assert(transitionOrderSchema.safeParse(validCollectTransition).success, "Valid transition to 'collected' with OTP passes");

const missingOtpCollectTransition = {
  status: "collected",
  notes: "Attempting collect without OTP",
};
assert(!transitionOrderSchema.safeParse(missingOtpCollectTransition).success, "Transition to 'collected' without OTP is strictly rejected");

const missingOtpDeliverTransition = {
  status: "delivered",
};
assert(!transitionOrderSchema.safeParse(missingOtpDeliverTransition).success, "Transition to 'delivered' without OTP is strictly rejected");

console.log(`\n=== Tests Complete: ${passCount} passed, ${failCount} failed ===`);
if (failCount > 0) {
  process.exit(1);
}
