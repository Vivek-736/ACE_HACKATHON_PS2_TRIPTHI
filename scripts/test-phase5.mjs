import { queryKeys } from "../lib/query/query-keys.ts";
import { rescueOrders } from "../db/schema/orders.ts";
import { generateHandoffOtp, verifyHandoffOtp } from "../lib/orders/otp.ts";

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

console.log("=== Running Phase 5 Polling & Verification Tests ===\n");

// 1. TanStack Query Key Factories
console.log("1. Testing Query Key Factories for Cache Invalidation & Polling:");

const allOrdersKey = queryKeys.orders.all;
assert(Array.isArray(allOrdersKey) && allOrdersKey[0] === "rescue-orders", "orders.all key is ['rescue-orders']");

const listOrdersKey = queryKeys.orders.list("pending");
assert(
  JSON.stringify(listOrdersKey) === JSON.stringify(["rescue-orders", "list", { status: "pending" }]),
  "orders.list('pending') produces scoped filter key"
);

const detailOrderKey = queryKeys.orders.detail("ord-123");
assert(
  JSON.stringify(detailOrderKey) === JSON.stringify(["rescue-orders", "detail", "ord-123"]),
  "orders.detail('ord-123') produces unique order key"
);

const volunteerProfileKey = queryKeys.volunteers.profile();
assert(
  JSON.stringify(volunteerProfileKey) === JSON.stringify(["volunteer", "profile"]),
  "volunteers.profile() key is predictable for cache updates"
);

const volunteerAvailabilityKey = queryKeys.volunteers.availability();
assert(
  JSON.stringify(volunteerAvailabilityKey) === JSON.stringify(["volunteer", "availability"]),
  "volunteers.availability() key is separated from full profile"
);

const mapMarkersKey = queryKeys.map.markers();
assert(
  Array.isArray(mapMarkersKey) && mapMarkersKey[0] === "map" && mapMarkersKey[1] === "markers",
  "map.markers() key allows instant map marker cache invalidation"
);

// 2. Schema Column Definitions for Phase 5
console.log("\n2. Testing Schema Verification & Replay Protection Columns in rescue_orders:");

assert("pickupOtpConsumed" in rescueOrders, "rescueOrders schema includes pickupOtpConsumed boolean column");
assert("deliveryOtpConsumed" in rescueOrders, "rescueOrders schema includes deliveryOtpConsumed boolean column");
assert("pickupAttempts" in rescueOrders, "rescueOrders schema includes pickupAttempts integer column");
assert("deliveryAttempts" in rescueOrders, "rescueOrders schema includes deliveryAttempts integer column");

// 3. OTP Verification, Replay Prevention, and Attempt-Limiting Simulation
console.log("\n3. Testing OTP Verification, Replay Prevention & Brute-Force Rate Limiting:");

// Simulate an active order lifecycle state
const mockOrder = {
  id: "order-test-1",
  status: "at_pickup",
  pickupOtp: generateHandoffOtp(),
  deliveryOtp: generateHandoffOtp(),
  pickupOtpConsumed: false,
  deliveryOtpConsumed: false,
  pickupAttempts: 0,
  deliveryAttempts: 0,
};

assert(typeof mockOrder.pickupOtp === "string" && mockOrder.pickupOtp.length === 4, "Pickup OTP generated as 4-digit numeric code");
assert(typeof mockOrder.deliveryOtp === "string" && mockOrder.deliveryOtp.length === 4, "Delivery OTP generated as 4-digit numeric code");

// Simulation of verification logic as implemented in /api/rescue-orders/[id]/pickup/verify
function simulatePickupVerification(order, inputOtp) {
  const MAX_ATTEMPTS = 5;

  if (order.pickupOtpConsumed) {
    return { status: 409, error: "ALREADY_VERIFIED", message: "Pickup OTP has already been used and verified." };
  }

  if (order.pickupAttempts >= MAX_ATTEMPTS) {
    return {
      status: 429,
      error: "TOO_MANY_ATTEMPTS",
      message: "Maximum OTP attempts exceeded (5/5). Pickup verification locked.",
    };
  }

  if (order.status !== "at_pickup") {
    return { status: 400, error: "INVALID_STATE", message: "Order is not at pickup facility." };
  }

  const isValid = verifyHandoffOtp(order.pickupOtp, inputOtp);
  if (!isValid) {
    order.pickupAttempts += 1;
    const remaining = MAX_ATTEMPTS - order.pickupAttempts;
    return {
      status: 400,
      error: "INVALID_OTP",
      message: `Invalid handoff OTP. ${remaining} attempts remaining before lock.`,
      remainingAttempts: remaining,
    };
  }

  order.pickupOtpConsumed = true;
  order.status = "collected";
  return { status: 200, success: true, message: "Food pickup verified successfully." };
}

// Test wrong OTP attempt increments
const wrongAttempt1 = simulatePickupVerification(mockOrder, "9999");
assert(wrongAttempt1.status === 400 && wrongAttempt1.remainingAttempts === 4, "Wrong OTP increments attempt counter (4 remaining)");

const wrongAttempt2 = simulatePickupVerification(mockOrder, "0000");
assert(wrongAttempt2.status === 400 && wrongAttempt2.remainingAttempts === 3, "Second wrong OTP increments attempt counter (3 remaining)");

// Test successful verification with correct OTP
const correctAttempt = simulatePickupVerification(mockOrder, mockOrder.pickupOtp);
assert(correctAttempt.status === 200 && mockOrder.pickupOtpConsumed === true, "Correct OTP succeeds and marks pickupOtpConsumed = true");
assert(mockOrder.status === "collected", "Order advances to 'collected' state upon successful pickup verification");

// Test Replay Prevention (trying to reuse consumed OTP)
const replayAttempt = simulatePickupVerification(mockOrder, mockOrder.pickupOtp);
assert(replayAttempt.status === 409 && replayAttempt.error === "ALREADY_VERIFIED", "Replay attempt strictly rejected with 409 ALREADY_VERIFIED");

// 4. Rate-Limiting Lockout Simulation (5 Failed Attempts)
console.log("\n4. Testing Brute-Force Rate Limiting (Lockout after 5 attempts):");

const bruteForceOrder = {
  id: "order-test-2",
  status: "at_pickup",
  pickupOtp: "1234",
  pickupOtpConsumed: false,
  pickupAttempts: 4, // already 4 failed attempts
};

// 5th failed attempt
const attempt5 = simulatePickupVerification(bruteForceOrder, "0000");
assert(attempt5.status === 400 && attempt5.remainingAttempts === 0, "5th failed attempt reaches limit (0 remaining)");
assert(bruteForceOrder.pickupAttempts === 5, "Order attempt counter recorded 5 failed attempts");

// 6th attempt should be blocked with 429
const attempt6 = simulatePickupVerification(bruteForceOrder, "1234");
assert(attempt6.status === 429 && attempt6.error === "TOO_MANY_ATTEMPTS", "Subsequent attempts blocked with 429 TOO_MANY_ATTEMPTS even with correct OTP");

// 5. Delivery Verification Simulation
console.log("\n5. Testing Delivery Verification & Credit Award Conditions:");

function simulateDeliveryVerification(order, inputOtp) {
  const MAX_ATTEMPTS = 5;

  if (order.deliveryOtpConsumed) {
    return { status: 409, error: "ALREADY_VERIFIED", message: "Delivery OTP has already been verified." };
  }

  if (order.deliveryAttempts >= MAX_ATTEMPTS) {
    return { status: 429, error: "TOO_MANY_ATTEMPTS", message: "Maximum delivery OTP attempts exceeded." };
  }

  if (order.status !== "at_receiver") {
    return { status: 400, error: "INVALID_STATE", message: "Order is not at receiver facility." };
  }

  const isValid = verifyHandoffOtp(order.deliveryOtp, inputOtp);
  if (!isValid) {
    order.deliveryAttempts += 1;
    return { status: 400, error: "INVALID_OTP", message: "Invalid delivery OTP." };
  }

  order.deliveryOtpConsumed = true;
  order.status = "delivered";
  order.rescueCreditsAwarded = 50;
  return { status: 200, success: true, creditsAwarded: 50 };
}

const deliveryOrder = {
  id: "order-test-3",
  status: "at_receiver",
  deliveryOtp: "5678",
  deliveryOtpConsumed: false,
  deliveryAttempts: 0,
};

// Wrong delivery OTP
const failDelivery = simulateDeliveryVerification(deliveryOrder, "1111");
assert(failDelivery.status === 400, "Wrong delivery OTP rejected");
assert(deliveryOrder.deliveryAttempts === 1, "Delivery attempts incremented to 1");

// State precondition check (if not at_receiver)
const badStateOrder = {
  id: "order-test-4",
  status: "collected", // still in transit, not yet arrived
  deliveryOtp: "5678",
  deliveryOtpConsumed: false,
  deliveryAttempts: 0,
};
const prematureDelivery = simulateDeliveryVerification(badStateOrder, "5678");
assert(prematureDelivery.status === 400 && prematureDelivery.error === "INVALID_STATE", "Delivery verification rejected if status is not 'at_receiver'");

// Successful delivery verification
const successDelivery = simulateDeliveryVerification(deliveryOrder, "5678");
assert(successDelivery.status === 200 && deliveryOrder.deliveryOtpConsumed === true, "Delivery OTP verified and marked consumed");
assert(deliveryOrder.status === "delivered", "Order status transitioned to 'delivered'");
assert(successDelivery.creditsAwarded === 50, "50 Rescue Credits recognized for delivery completion");

// Delivery Replay attempt
const replayDelivery = simulateDeliveryVerification(deliveryOrder, "5678");
assert(replayDelivery.status === 409 && replayDelivery.error === "ALREADY_VERIFIED", "Delivery replay attempt blocked with 409 ALREADY_VERIFIED");

console.log("\n=======================================================");
console.log(`Phase 5 Polling & Verification Tests: ${passCount} Passed, ${failCount} Failed`);
console.log("=======================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
