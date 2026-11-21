import { createListingSchema } from "../lib/validations/listing.ts";
import {
  createFoodRequestSchema,
  reserveListingSchema,
  updateReceiverProfileSchema,
} from "../lib/validations/request.ts";

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

console.log("=== Running Phase 2 Business Rules & Validation Tests ===\n");

// 1. Listing Validation Tests
console.log("1. Testing Food Listing Validation:");

const validListing = {
  title: "Vegetable Biryani & Dal Makhani",
  foodCategory: "cooked_meals",
  dietType: "vegetarian",
  quantityPortions: 45,
  weightKg: 18.5,
  preparedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  pickupBy: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hrs from now
  storageInstructions: "hot_holding",
  allergenInfo: "dairy",
  handlingNotes: "Packed in insulated carriers",
  locationName: "Cyber Pearl, Madhapur",
  latitude: 17.4483,
  longitude: 78.3815,
};

const validResult = createListingSchema.safeParse(validListing);
assert(validResult.success, "Valid surplus food listing payload passes validation");

// Pickup in the past should fail
const pastPickupListing = {
  ...validListing,
  pickupBy: new Date(Date.now() - 10 * 60 * 1000),
};
const pastPickupResult = createListingSchema.safeParse(pastPickupListing);
assert(
  !pastPickupResult.success,
  "Expired pickup deadline (in the past) is strictly rejected"
);

// Prepared after pickup deadline should fail
const invalidTimeOrderListing = {
  ...validListing,
  preparedAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
  pickupBy: new Date(Date.now() + 2 * 60 * 60 * 1000),
};
const invalidTimeResult = createListingSchema.safeParse(invalidTimeOrderListing);
assert(
  !invalidTimeResult.success,
  "Preparation time after pickup deadline is strictly rejected"
);

// Zero or negative portions should fail
const zeroPortionsListing = {
  ...validListing,
  quantityPortions: 0,
};
const zeroPortionsResult = createListingSchema.safeParse(zeroPortionsListing);
assert(
  !zeroPortionsResult.success,
  "Zero portions is rejected (must be at least 1 portion)"
);

// Missing allergen info should fail
const missingAllergenListing = {
  ...validListing,
  allergenInfo: "",
};
const missingAllergenResult = createListingSchema.safeParse(missingAllergenListing);
assert(
  !missingAllergenResult.success,
  "Missing allergen information is rejected (allergen info is mandatory)"
);

// 2. Food Request Validation Tests
console.log("\n2. Testing Food Request Validation:");

const validRequest = {
  title: "Seeking 50 portions of dinner meals",
  requestedPortions: 50,
  foodPreferences: "Cooked meals, Dal, Rice",
  dietaryConstraints: "Vegetarian only",
  neededBy: new Date(Date.now() + 4 * 60 * 60 * 1000),
  preferredRadiusKm: 10,
  locationName: "Financial District Shelter",
  latitude: 17.4156,
  longitude: 78.3428,
};

const validRequestResult = createFoodRequestSchema.safeParse(validRequest);
assert(validRequestResult.success, "Valid receiver food request passes validation");

// Past neededBy should fail
const pastNeededByRequest = {
  ...validRequest,
  neededBy: new Date(Date.now() - 3600000),
};
const pastNeededResult = createFoodRequestSchema.safeParse(pastNeededByRequest);
assert(!pastNeededResult.success, "Food request with past neededBy time is rejected");

// 3. Reservation & Capacity Validation Tests
console.log("\n3. Testing Reservation & Capacity Validation:");

const validReservation = {
  portionsRequested: 30,
  notes: "Volunteer can pick up at 8pm",
};
const validResResult = reserveListingSchema.safeParse(validReservation);
assert(validResResult.success, "Valid reservation request passes validation");

const zeroReservation = {
  portionsRequested: 0,
};
const zeroResResult = reserveListingSchema.safeParse(zeroReservation);
assert(
  !zeroResResult.success,
  "Reservation with 0 portions is rejected (must be at least 1)"
);

const validCapacityUpdate = {
  dailyCapacityPortions: 200,
  currentCapacityPortions: 120,
  dietaryPreferences: "Vegetarian, Bakery",
  serviceRadiusKm: 15,
  operatingHours: "09:00 - 21:00",
};
const validCapResult = updateReceiverProfileSchema.safeParse(validCapacityUpdate);
assert(validCapResult.success, "Valid receiver capacity update passes validation");

const negativeCapUpdate = {
  dailyCapacityPortions: -10,
  currentCapacityPortions: -5,
};
const negCapResult = updateReceiverProfileSchema.safeParse(negativeCapUpdate);
assert(!negCapResult.success, "Negative capacity update is strictly rejected");

console.log(`\n=== Tests Complete: ${passCount} passed, ${failCount} failed ===`);
if (failCount > 0) {
  process.exit(1);
}
