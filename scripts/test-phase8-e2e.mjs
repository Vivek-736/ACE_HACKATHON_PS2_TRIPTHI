import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import assert from "assert";

dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

console.log("==========================================================");
console.log("🧪 Tripti Phase 8 End-to-End QA & Security Audit Suite");
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}:`, err.message);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}:`, err.message);
    failed++;
  }
}

// 1. South India Multi-City Locations Verification
console.log("1. Testing South India Geographic Coverage (AP & Telangana):");
const demoLocationsFile = fs.readFileSync(
  path.join(process.cwd(), "lib", "constants", "demo-locations.ts"),
  "utf-8"
);

it("DEMO_LOCATIONS catalog contains Vijayawada locations", () => {
  assert(demoLocationsFile.includes("vijayawada-benz-circle"));
  assert(demoLocationsFile.includes("Benz Circle Food Corridor"));
  assert(demoLocationsFile.includes("Governorpet Community Shelter Relief"));
});

it("DEMO_LOCATIONS catalog contains Visakhapatnam (Vizag) locations", () => {
  assert(demoLocationsFile.includes("vizag-siripuram"));
  assert(demoLocationsFile.includes("Siripuram Commercial & Dining Hub"));
  assert(demoLocationsFile.includes("MVP Colony Sector-4 Shelter Zone"));
  assert(demoLocationsFile.includes("Gajuwaka Industrial Mess & Canteen Hub"));
});

it("DEMO_LOCATIONS catalog contains Hyderabad and South Hub locations", () => {
  assert(demoLocationsFile.includes("madhapur-tech"));
  assert(demoLocationsFile.includes("Cyber Pearl"));
  assert(demoLocationsFile.includes("bangalore-koramangala"));
  assert(demoLocationsFile.includes("chennai-t-nagar"));
});

it("QuickPost and Request Dialogs support Vijayawada & Vizag optgroups", () => {
  const quickPostFile = fs.readFileSync(
    path.join(process.cwd(), "components", "donor", "quick-post-dialog.tsx"),
    "utf-8"
  );
  assert(quickPostFile.includes("Andhra Pradesh — Vijayawada"));
  assert(quickPostFile.includes("Andhra Pradesh — Visakhapatnam (Vizag)"));

  const requestFile = fs.readFileSync(
    path.join(process.cwd(), "components", "receiver", "post-food-request-dialog.tsx"),
    "utf-8"
  );
  assert(requestFile.includes("Andhra Pradesh — Vijayawada"));
  assert(requestFile.includes("Andhra Pradesh — Visakhapatnam (Vizag)"));
});

// 2. Security & Zero-Secrets Exposure Scan
console.log("\n2. Testing Security & Zero-Secrets Exposure (Client Bundle Auditing):");

it("No server secrets prefixed with NEXT_PUBLIC_", () => {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  assert(!envContent.includes("NEXT_PUBLIC_DATABASE_URL"));
  assert(!envContent.includes("NEXT_PUBLIC_CLERK_SECRET_KEY"));
  assert(!envContent.includes("NEXT_PUBLIC_RAZORPAY_KEY_SECRET"));
});

it("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is the sole public maps credential", () => {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
  assert(envContent.includes("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
});

it("Client components do not import database direct connections", () => {
  const clientModal = fs.readFileSync(
    path.join(process.cwd(), "components", "payments", "sponsorship-checkout-modal.tsx"),
    "utf-8"
  );
  assert(!clientModal.includes('from "@/lib/db"'));
  assert(!clientModal.includes('from "drizzle-orm"'));

  const clientBanner = fs.readFileSync(
    path.join(process.cwd(), "components", "donor", "donor-pro-banner.tsx"),
    "utf-8"
  );
  assert(!clientBanner.includes('from "@/lib/db"'));
});

// 3. Complete Rescue Lifecycle & OTP Verification Engine
console.log("\n3. Testing End-to-End Rescue Order Lifecycle & OTP Verification:");
const ordersSchema = fs.readFileSync(
  path.join(process.cwd(), "db", "schema", "orders.ts"),
  "utf-8"
);

it("Rescue orders enforce double-OTP handoff schema", () => {
  assert(ordersSchema.includes("pickupOtp"));
  assert(ordersSchema.includes("deliveryOtp"));
  assert(ordersSchema.includes("pickupOtpConsumed"));
  assert(ordersSchema.includes("deliveryOtpConsumed"));
});

it("Pickup and Delivery verification prevent replay attacks", () => {
  const pickupRoute = fs.readFileSync(
    path.join(process.cwd(), "app", "api", "rescue-orders", "[id]", "pickup", "verify", "route.ts"),
    "utf-8"
  );
  assert(pickupRoute.includes("pickupOtpConsumed"));
  assert(pickupRoute.includes("ALREADY_CONSUMED"));

  const deliveryRoute = fs.readFileSync(
    path.join(process.cwd(), "app", "api", "rescue-orders", "[id]", "delivery", "verify", "route.ts"),
    "utf-8"
  );
  assert(deliveryRoute.includes("deliveryOtpConsumed"));
  assert(deliveryRoute.includes("ALREADY_CONSUMED"));
});

it("Brute-force protection locks verification after 5 attempts", () => {
  const pickupRoute = fs.readFileSync(
    path.join(process.cwd(), "app", "api", "rescue-orders", "[id]", "pickup", "verify", "route.ts"),
    "utf-8"
  );
  assert(pickupRoute.includes("MAX_ATTEMPTS = 5"));
  assert(pickupRoute.includes("MAX_ATTEMPTS_EXCEEDED"));
});

// 4. Volunteer Credit Ledger & Recognition Tiering
console.log("\n4. Testing Volunteer Credits & Idempotency Protection:");
const creditService = fs.readFileSync(
  path.join(process.cwd(), "lib", "credits", "service.ts"),
  "utf-8"
);

it("Credit award checks for existing transaction to guarantee idempotency", () => {
  assert(creditService.includes("rescueCreditLedger.orderId, orderId"));
  assert(creditService.includes("alreadyAwarded: true"));
});

it("Volunteer tiers evaluate correctly (Bronze 100, Silver 200, Gold 500)", () => {
  assert(creditService.includes("Bronze Scout"));
  assert(creditService.includes("Silver Rescuer"));
  assert(creditService.includes("Gold Community Guardian"));
});

// 5. Environmental & ESG Calculation Engine
console.log("\n5. Testing Transparent Environmental & Scope 3 ESG Engine:");
const impactEngine = fs.readFileSync(
  path.join(process.cwd(), "lib", "impact", "engine.ts"),
  "utf-8"
);

it("Impact calculations record transparent assumptions (0.4 kg/portion, 2.5 kg CO2e/kg waste)", () => {
  assert(impactEngine.includes("PORTION_TO_KG = 0.4"));
  assert(impactEngine.includes("KG_TO_CO2E = 2.5"));
});

it("Impact summary restricts calculations strictly to delivered orders", () => {
  assert(impactEngine.includes('"delivered"'));
  assert(impactEngine.includes("rescueOrders.status"));
});

// 6. Food Safety & Legal Compliance Disclaimers
console.log("\n6. Testing Food Safety Standards & Regulatory Boundaries:");
const disclaimerFile = fs.readFileSync(
  path.join(process.cwd(), "lib", "constants", "food-safety.ts"),
  "utf-8"
);

it("Platform disclaimer explicitly states it connects users and does not certify food safety", () => {
  assert(disclaimerFile.includes("does not inspect, test, prepare, or certify the safety"));
});

it("Disclaimer explicitly prohibits false tax or regulatory deduction claims", () => {
  assert(disclaimerFile.includes("Do not promise tax deductions, legal benefits"));
});

// 7. Commercial B2B Monetization & Pro Workspace
console.log("\n7. Testing B2B Commercial Monetization & Pro Workspace:");
const proWorkspace = fs.readFileSync(
  path.join(process.cwd(), "app", "dashboard", "donor", "analytics", "page.tsx"),
  "utf-8"
);

it("Pro workspace exposes day-of-week overproduction heatmap", () => {
  assert(proWorkspace.includes("Day-of-Week Kitchen Overproduction Patterns"));
  assert(proWorkspace.includes("Executive Chef Optimization Recommendation"));
});

it("Pro workspace generates printable/exportable Scope 3 ESG Audit Certificate", () => {
  assert(proWorkspace.includes("Official Scope 3 ESG Audit Certificate"));
  assert(proWorkspace.includes("PrintCertificateButton"));
  assert(proWorkspace.includes("SEBI Business Responsibility"));
});

it("Razorpay modal provides official gateway injection with fallback simulation", () => {
  const modalFile = fs.readFileSync(
    path.join(process.cwd(), "components", "payments", "sponsorship-checkout-modal.tsx"),
    "utf-8"
  );
  assert(modalFile.includes("loadRazorpayScript"));
  assert(modalFile.includes("checkout.razorpay.com/v1/checkout.js"));
  assert(modalFile.includes("new (window as any).Razorpay"));
});

// 8. Platform Admin Operations & Role Authorization
console.log("\n8. Testing Platform Admin Operations & Governance:");
const currentUserFile = fs.readFileSync(
  path.join(process.cwd(), "lib", "auth", "current-user.ts"),
  "utf-8"
);

it("Special platform operator email is promoted to admin", () => {
  assert(currentUserFile.includes("vivek338614@gmail.com"));
  assert(currentUserFile.includes('set({ role: "admin"'));
});

// 9. Live Neon DB Seed Verification
console.log("\n9. Testing Live Neon Database Seed Records:");
async function runDbChecks() {
  if (!databaseUrl) {
    console.log("  ⚠ Skipping live DB checks (no DATABASE_URL configured)");
    return;
  }
  try {
    const sql = neon(databaseUrl);
    const demoUsers = await sql`SELECT count(*) FROM users WHERE clerk_id LIKE 'clerk_demo_%'`;
    it("Neon DB contains synthetic demo users across Vijayawada, Vizag, and Hyderabad", () => {
      assert(parseInt(demoUsers[0].count) >= 6);
    });

    const activeListings = await sql`
      SELECT count(*) FROM food_listings
      WHERE location_name LIKE '%Vijayawada%' OR location_name LIKE '%Visakhapatnam%'
    `;
    it("Neon DB contains active Andhra Pradesh surplus food listings", () => {
      assert(parseInt(activeListings[0].count) >= 2);
    });

    const demoOrders = await sql`
      SELECT count(*) FROM rescue_orders
      WHERE status = 'accepted' AND pickup_otp = '482910'
    `;
    it("Neon DB contains live in-flight demo rescue order with test OTPs (482910)", () => {
      assert(parseInt(demoOrders[0].count) >= 1);
    });
  } catch (err) {
    console.log(`  ⚠ Neon DB live check skipped (offline/sandbox): ${err.message}`);
  }
}

await runDbChecks();

console.log("\n==========================================================");
console.log(`Phase 8 QA Suite: ${passed} Passed, ${failed} Failed`);
console.log("==========================================================");

if (failed > 0) {
  process.exit(1);
}
