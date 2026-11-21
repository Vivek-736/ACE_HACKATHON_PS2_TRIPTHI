import {
  calculateHaversineDistanceKm,
  isWithinRadius,
  calculateBoundingBox,
  estimateTravelTimeMinutes,
} from "../lib/maps/haversine.ts";
import {
  updateVolunteerLocationSchema,
  updateVolunteerAvailabilitySchema,
} from "../lib/validations/volunteer.ts";
import { ROLE_MARKER_COLORS } from "../lib/maps/map-styles.ts";

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

console.log("=== Running Phase 3 Spatial, Location & Map Tests ===\n");

// 1. Haversine Distance Calculations
console.log("1. Testing Haversine Distance Calculations:");

// Ground truth distance between Cyber Pearl (Madhapur: 17.4483, 78.3815)
// and DLF Cybercity (Gachibowli: 17.4435, 78.3571) ≈ 2.64 km
const madhapurToGachibowli = calculateHaversineDistanceKm(
  17.4483,
  78.3815,
  17.4435,
  78.3571
);
assert(
  madhapurToGachibowli >= 2.5 && madhapurToGachibowli <= 2.8,
  `Madhapur to Gachibowli distance is accurate (${madhapurToGachibowli} km, expected ~2.64 km)`
);

// Ground truth distance between Madhapur (17.4483, 78.3815) and Begumpet (17.4448, 78.4682) ≈ 9.2 km
const madhapurToBegumpet = calculateHaversineDistanceKm(
  17.4483,
  78.3815,
  17.4448,
  78.4682
);
assert(
  madhapurToBegumpet >= 9.0 && madhapurToBegumpet <= 9.5,
  `Madhapur to Begumpet distance is accurate (${madhapurToBegumpet} km, expected ~9.2 km)`
);

// Identical coordinates should be 0.00 km
const zeroDist = calculateHaversineDistanceKm(17.4483, 78.3815, 17.4483, 78.3815);
assert(zeroDist === 0, `Identical coordinates calculate to exactly 0.00 km (${zeroDist} km)`);

// 2. Radius and Bounding Box Logic
console.log("\n2. Testing Spatial Radius and Bounding Box Filtering:");

assert(
  isWithinRadius(17.4483, 78.3815, 17.4435, 78.3571, 5),
  "Gachibowli is correctly identified as within 5 km radius of Madhapur"
);

assert(
  !isWithinRadius(17.4483, 78.3815, 17.4448, 78.4682, 5),
  "Begumpet is correctly excluded from a 5 km radius of Madhapur"
);

const bbox = calculateBoundingBox(17.4483, 78.3815, 10);
assert(
  bbox.minLat < 17.4483 &&
    bbox.maxLat > 17.4483 &&
    bbox.minLng < 78.3815 &&
    bbox.maxLng > 78.3815,
  "Bounding box correctly encloses the center point with valid geographic bounds"
);

// 3. Travel Time Estimation Matrix
console.log("\n3. Testing Travel Time & ETA Calculations:");

const bikeEta = estimateTravelTimeMinutes(5.0, "bicycle");
const motoEta = estimateTravelTimeMinutes(5.0, "motorcycle");
const walkEta = estimateTravelTimeMinutes(5.0, "on_foot");

assert(
  motoEta < bikeEta && bikeEta < walkEta,
  `Transport speeds hierarchy holds: Motorcycle (${motoEta}m) < Bicycle (${bikeEta}m) < Foot (${walkEta}m)`
);

// 4. Role Marker Semantics & Colors
console.log("\n4. Testing Role Marker Semantics & Colors:");

assert(
  ROLE_MARKER_COLORS.donor.bg === "#1b4d3e",
  "Donor marker uses Tripti forest-green brand token (#1b4d3e)"
);
assert(
  ROLE_MARKER_COLORS.receiver.bg === "#059669",
  "Receiver marker uses emerald green token (#059669)"
);
assert(
  ROLE_MARKER_COLORS.volunteer.available.bg === "#10b981" &&
    ROLE_MARKER_COLORS.volunteer.busy.bg === "#2563eb" &&
    ROLE_MARKER_COLORS.volunteer.offline.bg === "#6b7280",
  "Volunteer markers correctly color-code available, busy, and offline states"
);

// 5. Volunteer Location & Availability Schema Validation
console.log("\n5. Testing Volunteer Location & Availability Validation:");

const validLoc = {
  locationName: "Cyber Pearl, Madhapur",
  latitude: 17.4483,
  longitude: 78.3815,
  preferredRadiusKm: 15,
  transportMode: "motorcycle",
};
assert(
  updateVolunteerLocationSchema.safeParse(validLoc).success,
  "Valid volunteer location update passes validation"
);

const invalidLat = {
  ...validLoc,
  latitude: 99.5, // Beyond latitude limit of 90
};
assert(
  !updateVolunteerLocationSchema.safeParse(invalidLat).success,
  "Invalid latitude (> 90 deg) is strictly rejected"
);

const invalidLng = {
  ...validLoc,
  longitude: 195.2, // Beyond longitude limit of 180
};
assert(
  !updateVolunteerLocationSchema.safeParse(invalidLng).success,
  "Invalid longitude (> 180 deg) is strictly rejected"
);

const validAvailability = {
  availabilityStatus: "available",
};
assert(
  updateVolunteerAvailabilitySchema.safeParse(validAvailability).success,
  "Valid availability status ('available') passes validation"
);

const invalidAvailability = {
  availabilityStatus: "sleeping",
};
assert(
  !updateVolunteerAvailabilitySchema.safeParse(invalidAvailability).success,
  "Invalid availability status is rejected"
);

console.log(`\n=== Tests Complete: ${passCount} passed, ${failCount} failed ===\n`);

if (failCount > 0) {
  process.exit(1);
}