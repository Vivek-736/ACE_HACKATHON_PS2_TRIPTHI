/**
 * Phase 6 Verification Test Suite - Tripti Food Rescue Platform
 * Validates:
 * 1. Notifications schema definitions and allowed enum types
 * 2. Transactional email templates (claimed, reminder, delivery, expired)
 * 3. Nodemailer dispatch engine & simulation mode
 * 4. Background jobs & Trigger.dev task declarations
 * 5. In-app notification service contract
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("🧪 Starting Phase 6 Test Suite: Notifications, Background Jobs & Expiry\n");

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}\n`);
  }
}

async function runAsyncTests() {
  // Test 1: Notifications schema export
  test("Notifications schema contains expected notification types and channels", () => {
    const schemaFile = fs.readFileSync(
      path.resolve("db/schema/notifications.ts"),
      "utf-8"
    );
    assert(schemaFile.includes("listing_claimed"), "Missing listing_claimed type");
    assert(schemaFile.includes("order_assigned"), "Missing order_assigned type");
    assert(schemaFile.includes("food_collected"), "Missing food_collected type");
    assert(schemaFile.includes("food_delivered"), "Missing food_delivered type");
    assert(schemaFile.includes("listing_expired"), "Missing listing_expired type");
    assert(schemaFile.includes("volunteer_reminder"), "Missing volunteer_reminder type");
    assert(schemaFile.includes('"in_app"'), "Missing in_app channel");
    assert(schemaFile.includes('"email"'), "Missing email channel");
    assert(schemaFile.includes('"both"'), "Missing both channel");
    assert(schemaFile.includes("notifications_user_id_idx"), "Missing user_id index");
    assert(schemaFile.includes("notifications_created_at_idx"), "Missing created_at index");
  });

  // Test 2: Listing claimed email template
  test("Listing claimed email renders OTP and details in brand palette", async () => {
    const { generateListingClaimedEmail } = await import("../lib/email/templates.ts");
    const email = generateListingClaimedEmail({
      donorName: "Novotel Hyderabad",
      listingTitle: "Buffet Biryani & Curries",
      portions: 50,
      receiverName: "Akshaya Patra Foundation",
      pickupDeadline: "10:30 PM",
      pickupOtp: "7842",
      orderId: "ord-test-1",
    });

    assert(email.subject.includes("Surplus Claimed"), "Subject should state surplus claimed");
    assert(email.subject.includes("50 portions"), "Subject should include portion count");
    assert(email.html.includes("Novotel Hyderabad"), "HTML must contain donor name");
    assert(email.html.includes("Akshaya Patra Foundation"), "HTML must contain receiver name");
    assert(email.html.includes("7842"), "HTML must contain the pickup OTP");
    assert(email.html.includes("#1b4332"), "HTML must use brand forest green token");
    assert(email.html.includes("Safety Note"), "HTML must contain mandatory safety disclaimer");
  });

  // Test 3: Volunteer reminder email template
  test("Volunteer reminder email renders pickup & dropoff destinations", async () => {
    const { generateVolunteerReminderEmail } = await import("../lib/email/templates.ts");
    const email = generateVolunteerReminderEmail({
      volunteerName: "Vivek Courier",
      listingTitle: "Fresh Meals",
      donorName: "Paradise Biryani",
      donorAddress: "Madhapur, Hyderabad",
      receiverName: "Sphoorti Orphanage",
      receiverAddress: "Dundigal, Hyderabad",
      portions: 35,
      pickupDeadline: "9:00 PM",
      orderId: "ord-test-2",
    });

    assert(email.subject.includes("[Tripti Reminder]"), "Subject should include Tripti Reminder prefix");
    assert(email.html.includes("Vivek Courier"), "HTML must contain volunteer name");
    assert(email.html.includes("Paradise Biryani"), "HTML must contain donor address");
    assert(email.html.includes("Sphoorti Orphanage"), "HTML must contain dropoff name");
  });

  // Test 4: Delivery completed email template with impact metrics
  test("Delivery completed email computes and renders verified impact", async () => {
    const { generateDeliveryCompletedEmail } = await import("../lib/email/templates.ts");
    const email = generateDeliveryCompletedEmail({
      recipientName: "ITC Kohenur",
      isDonor: true,
      listingTitle: "Banquet Pastries",
      portions: 40,
      mealsSaved: 40,
      co2eKgAvoided: 40.0,
      receiverName: "Grace Children Home",
      donorName: "ITC Kohenur",
      orderId: "ord-test-3",
    });

    assert(email.subject.includes("Mission Accomplished"), "Subject must celebrate completed mission");
    assert(email.html.includes("40"), "HTML must include meals saved");
    assert(email.html.includes("40 kg"), "HTML must include CO2e avoided");
    assert(email.html.includes("Grace Children Home"), "HTML must mention receiver");
  });

  // Test 5: Listing expired email template
  test("Listing expired email notifies donor with safety guidance", async () => {
    const { generateListingExpiredEmail } = await import("../lib/email/templates.ts");
    const email = generateListingExpiredEmail({
      donorName: "Bawarchi Restaurant",
      listingTitle: "Surplus Roti & Sabzi",
      portions: 25,
      expiredAt: "11:00 PM",
    });

    assert(email.subject.includes("Listing Expired"), "Subject must state listing expired");
    assert(email.html.includes("Bawarchi Restaurant"), "HTML must address donor");
    assert(email.html.includes("closed"), "HTML must confirm listing closure");
    assert(email.html.includes("food safety"), "HTML must mention food safety");
  });

  // Test 6: Nodemailer client handles simulation gracefully when SMTP is unconfigured or in tests
  test("Nodemailer client provides safe fallback simulation", async () => {
    const { sendEmail } = await import("../lib/email/client.ts");
    const result = await sendEmail({
      to: "recipient@example.com",
      subject: "Test Notification",
      html: "<p>Hello world</p>",
    });

    assert(result.success === true, "Send result must indicate success");
    assert(typeof result.messageId === "string", "Must return a messageId");
  });

  // Test 7: Trigger.dev background task declarations
  test("Trigger.dev tasks are properly declared and configured", () => {
    const expireTaskFile = fs.readFileSync(path.resolve("trigger/expire-listings.ts"), "utf-8");
    const reminderTaskFile = fs.readFileSync(path.resolve("trigger/volunteer-reminder.ts"), "utf-8");

    assert(expireTaskFile.includes('id: "expire-listings"'), "Task id should be expire-listings");
    assert(reminderTaskFile.includes('id: "volunteer-reminders"'), "Task id should be volunteer-reminders");
  });

  // Test 8: Expiry & Reminder job functions
  test("Expiry and Reminder job processor source exists", () => {
    const jobSource = fs.readFileSync(path.resolve("lib/jobs/expiry.ts"), "utf-8");
    assert(jobSource.includes("export async function processListingExpiry"), "processListingExpiry must be exported");
    assert(jobSource.includes("export async function processVolunteerReminders"), "processVolunteerReminders must be exported");
  });

  // Test 9: Notification Bell UI component exists
  test("NotificationBell component is defined with real-time polling", () => {
    const bellSource = fs.readFileSync(path.resolve("components/notifications/notification-bell.tsx"), "utf-8");
    assert(bellSource.includes("export function NotificationBell"), "NotificationBell must be exported");
    assert(bellSource.includes("refetchInterval: 12000"), "Must poll every 12 seconds");
    assert(bellSource.includes("markAllReadMutation"), "Must provide mark-all-read mutation");
  });

  console.log(`\n========================================`);
  console.log(`Phase 6 Test Results: ${passed}/${total} passed`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAsyncTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
