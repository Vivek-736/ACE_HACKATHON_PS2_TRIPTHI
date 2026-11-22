import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function seed() {
  console.log("==========================================================");
  console.log("🌱 Seeding Tripti South India Demo Data (AP & Telangana)");
  console.log("   Cities: Vijayawada, Visakhapatnam, Hyderabad, Guntur");
  console.log("==========================================================\n");

  try {
    // 1. Clean existing synthetic demo records (prefixed with 'demo_')
    console.log("1. Cleaning prior synthetic demo records...");
    await sql`DELETE FROM users WHERE clerk_id LIKE 'clerk_demo_%'`;
    console.log("   -> Cleaned previous demo users & cascaded child records.\n");

    // 2. Create synthetic Demo Users
    console.log("2. Inserting synthetic users across Vijayawada, Vizag, and Hyderabad...");

    // Donors
    const [donorVja] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_donor_vja', 'donor.vja@tripti.test', 'Krishna Grand', 'Caterers', 'donor',
        'Krishna Grand Banquets & Caterers (Benz Circle)', 'Krishna Grand Caterers', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    const [donorVzg] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_donor_vzg', 'donor.vzg@tripti.test', 'Bay View', 'Convention', 'donor',
        'Bay View Convention & Dining Hub (Siripuram)', 'Bay View Dining', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    const [donorHyd] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_donor_hyd', 'donor.hyd@tripti.test', 'Paradise', 'Hitec', 'donor',
        'Paradise Food Court (Cyber Pearl, Madhapur)', 'Paradise Kitchen', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    // Receivers
    const [rcvVja] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_rcv_vja', 'receiver.vja@tripti.test', 'Amma Vodi', 'Shelter', 'receiver',
        'Amma Vodi Destitute Home & Kitchen (Governorpet)', 'Amma Vodi Care Home', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    const [rcvVzg] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_rcv_vzg', 'receiver.vzg@tripti.test', 'Preeti', 'Children Home', 'receiver',
        'Preeti Children Shelter & Care Home (MVP Colony)', 'Preeti Children Home', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    const [rcvHyd] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, organisation_name, display_name, verification_status
      ) VALUES (
        'clerk_demo_rcv_hyd', 'receiver.hyd@tripti.test', 'Sneha', 'Shelter Kitchen', 'receiver',
        'Sneha Orphanage & Community Kitchen (Begumpet)', 'Sneha Community Kitchen', 'verified'
      ) RETURNING id, organisation_name, role
    `;

    // Volunteers
    const [volVja] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, display_name, verification_status
      ) VALUES (
        'clerk_demo_vol_vja', 'volunteer.vja@tripti.test', 'Sai', 'Kumar', 'volunteer',
        'Sai Kumar (Vijayawada Volunteer Courier)', 'verified'
      ) RETURNING id, display_name, role
    `;

    const [volVzg] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, display_name, verification_status
      ) VALUES (
        'clerk_demo_vol_vzg', 'volunteer.vzg@tripti.test', 'Ravi', 'Varma', 'volunteer',
        'Ravi Varma (Vizag Coastal Courier)', 'verified'
      ) RETURNING id, display_name, role
    `;

    const [volHyd] = await sql`
      INSERT INTO users (
        clerk_id, email, first_name, last_name, role, display_name, verification_status
      ) VALUES (
        'clerk_demo_vol_hyd', 'volunteer.hyd@tripti.test', 'Pavan', 'Teja', 'volunteer',
        'Pavan Teja (Cyberabad Courier)', 'verified'
      ) RETURNING id, display_name, role
    `;

    console.log(`   -> Created Donors: ${donorVja.organisation_name}, ${donorVzg.organisation_name}, ${donorHyd.organisation_name}`);
    console.log(`   -> Created Receivers: ${rcvVja.organisation_name}, ${rcvVzg.organisation_name}, ${rcvHyd.organisation_name}`);
    console.log(`   -> Created Volunteers: ${volVja.display_name}, ${volVzg.display_name}, ${volHyd.display_name}\n`);

    // 3. Insert Volunteer Profiles
    console.log("3. Inserting volunteer staging profiles with synthetic South India coordinates...");
    await sql`
      INSERT INTO volunteer_profiles (
        user_id, availability_status, preferred_radius_km, transport_mode,
        location_name, latitude, longitude, rescue_credits, total_deliveries, on_time_rate
      ) VALUES
      (
        ${volVja.id}, 'available', 12, 'motorcycle',
        'Benz Circle Food Corridor, Vijayawada', '16.5033', '80.6465', 180, 4, '100.00'
      ),
      (
        ${volVzg.id}, 'available', 15, 'motorcycle',
        'MVP Colony Sector-4 Shelter Zone, Visakhapatnam', '17.7428', '83.3364', 350, 7, '98.50'
      ),
      (
        ${volHyd.id}, 'available', 10, 'motorcycle',
        'Cyber Pearl, Hitec City / Madhapur, Hyderabad', '17.4483', '78.3815', 90, 2, '100.00'
      )
    `;
    console.log("   -> Seeded volunteer profiles with active availability & credit ratings.\n");

    // 4. Insert Food Listings across Andhra Pradesh and Telangana
    console.log("4. Inserting surplus food listings...");
    const now = new Date();
    const prepared45MinsAgo = new Date(now.getTime() - 45 * 60 * 1000);
    const pickup3HoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const pickup4HoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    // Vijayawada Available Listing
    const [listingVjaAvailable] = await sql`
      INSERT INTO food_listings (
        donor_id, organisation_name, title, food_category, diet_type,
        quantity_portions, remaining_portions, weight_kg, prepared_at, pickup_by,
        storage_instructions, allergen_info, handling_notes, location_name,
        latitude, longitude, status
      ) VALUES (
        ${donorVja.id}, ${donorVja.organisation_name},
        'Vegetable Pulao, Mirchi Ka Salan & Curd Rice', 'cooked_meals', 'vegetarian',
        50, 50, '22.0', ${prepared45MinsAgo}, ${pickup3HoursLater},
        'hot_holding', 'dairy', 'Fresh banquet surplus. Kept in food-grade thermal containers at 65°C.',
        'Benz Circle Food Corridor, Vijayawada', '16.5033', '80.6465', 'available'
      ) RETURNING id, title, quantity_portions
    `;

    // Visakhapatnam Available Listing
    const [listingVzgAvailable] = await sql`
      INSERT INTO food_listings (
        donor_id, organisation_name, title, food_category, diet_type,
        quantity_portions, remaining_portions, weight_kg, prepared_at, pickup_by,
        storage_instructions, allergen_info, handling_notes, location_name,
        latitude, longitude, status
      ) VALUES (
        ${donorVzg.id}, ${donorVzg.organisation_name},
        'Lemon Rice, Drumstick Sambar & Mixed Veg Kurma', 'cooked_meals', 'vegetarian',
        65, 65, '26.5', ${prepared45MinsAgo}, ${pickup4HoursLater},
        'hot_holding', 'none', 'Convention center lunch surplus. Packed cleanly in steel urns.',
        'Siripuram Commercial & Dining Hub, Visakhapatnam', '17.7215', '83.3150', 'available'
      ) RETURNING id, title, quantity_portions
    `;

    // Hyderabad Available Listing
    const [listingHydAvailable] = await sql`
      INSERT INTO food_listings (
        donor_id, organisation_name, title, food_category, diet_type,
        quantity_portions, remaining_portions, weight_kg, prepared_at, pickup_by,
        storage_instructions, allergen_info, handling_notes, location_name,
        latitude, longitude, status
      ) VALUES (
        ${donorHyd.id}, ${donorHyd.organisation_name},
        'Hyderabadi Veg Dum Biryani & Bagara Baingan', 'cooked_meals', 'vegetarian',
        80, 80, '32.0', ${prepared45MinsAgo}, ${pickup3HoursLater},
        'hot_holding', 'dairy', 'Corporate dining hall batch. Freshly steam-held.',
        'Cyber Pearl, Hitec City / Madhapur, Hyderabad', '17.4483', '78.3815', 'available'
      ) RETURNING id, title, quantity_portions
    `;

    // Historical Completed Listing (Vijayawada)
    const [listingVjaCompleted] = await sql`
      INSERT INTO food_listings (
        donor_id, organisation_name, title, food_category, diet_type,
        quantity_portions, remaining_portions, weight_kg, prepared_at, pickup_by,
        storage_instructions, allergen_info, handling_notes, location_name,
        latitude, longitude, status
      ) VALUES (
        ${donorVja.id}, ${donorVja.organisation_name},
        'Fresh Whole Wheat Chapatis & Aloo Gobi', 'cooked_meals', 'vegan',
        40, 0, '12.0', ${new Date(now.getTime() - 24 * 3600 * 1000)}, ${new Date(now.getTime() - 20 * 3600 * 1000)},
        'room_temperature', 'gluten', 'Foil-packed bundles of 5.',
        'Benz Circle Food Corridor, Vijayawada', '16.5033', '80.6465', 'completed'
      ) RETURNING id, title
    `;

    // Historical Completed Listing (Hyderabad)
    const [listingHydCompleted] = await sql`
      INSERT INTO food_listings (
        donor_id, organisation_name, title, food_category, diet_type,
        quantity_portions, remaining_portions, weight_kg, prepared_at, pickup_by,
        storage_instructions, allergen_info, handling_notes, location_name,
        latitude, longitude, status
      ) VALUES (
        ${donorHyd.id}, ${donorHyd.organisation_name},
        'Sambar Rice & Curd Rice Meal Trays', 'cooked_meals', 'vegetarian',
        75, 0, '30.0', ${new Date(now.getTime() - 48 * 3600 * 1000)}, ${new Date(now.getTime() - 44 * 3600 * 1000)},
        'refrigerated', 'dairy', 'Hygienically portioned bento boxes.',
        'Cyber Pearl, Hitec City / Madhapur, Hyderabad', '17.4483', '78.3815', 'completed'
      ) RETURNING id, title
    `;

    console.log(`   -> Active Listing VJA: ${listingVjaAvailable.title} (${listingVjaAvailable.quantity_portions} portions)`);
    console.log(`   -> Active Listing VZG: ${listingVzgAvailable.title} (${listingVzgAvailable.quantity_portions} portions)`);
    console.log(`   -> Active Listing HYD: ${listingHydAvailable.title} (${listingHydAvailable.quantity_portions} portions)`);
    console.log(`   -> Completed Historical Listings seeded.\n`);

    // 5. Insert Food Requests (Community Kitchen Needs)
    console.log("5. Inserting community receiver food requests...");
    await sql`
      INSERT INTO food_requests (
        receiver_id, organisation_name, title, requested_portions,
        food_preferences, dietary_constraints, needed_by, preferred_radius_km,
        location_name, latitude, longitude, status
      ) VALUES
      (
        ${rcvVja.id}, ${rcvVja.organisation_name},
        'Seeking Warm Dinner Meals for 40 Destitute Residents', 40,
        'Cooked Meals, Rice, Dal, Veg Curries', 'Vegetarian preferred',
        ${new Date(now.getTime() + 5 * 3600 * 1000)}, 10,
        'Governorpet Community Shelter Relief, Vijayawada', '16.5165', '80.6275', 'active'
      ),
      (
        ${rcvVzg.id}, ${rcvVzg.organisation_name},
        'Nutritious Dinner for 50 Children at Care Shelter', 50,
        'Cooked Meals, Roti, Rice, Fresh Dal', 'No spicy food for children',
        ${new Date(now.getTime() + 6 * 3600 * 1000)}, 12,
        'MVP Colony Sector-4 Shelter Zone, Visakhapatnam', '17.7428', '83.3364', 'active'
      ),
      (
        ${rcvHyd.id}, ${rcvHyd.organisation_name},
        'Daily Shelter Supper Intake (60 Portions)', 60,
        'Cooked Meals, Khichdi, Veg Biryani', 'Any wholesome cooked meals',
        ${new Date(now.getTime() + 4 * 3600 * 1000)}, 15,
        'Old Airport Road, Begumpet, Hyderabad', '17.4448', '78.4678', 'active'
      )
    `;
    console.log("   -> Community requests inserted across Vijayawada, Vizag, and Hyderabad.\n");

    // 6. Insert Rescue Orders (Live In-Flight demo order + Completed audit orders)
    console.log("6. Inserting live in-flight and verified completed rescue orders...");

    // Live In-Flight Order for Vijayawada (Ready for OTP handoff demo)
    const [orderLiveVja] = await sql`
      INSERT INTO rescue_orders (
        listing_id, receiver_id, volunteer_id, allocated_portions,
        status, pickup_otp, delivery_otp, pickup_otp_consumed, delivery_otp_consumed,
        pickup_deadline
      ) VALUES (
        ${listingVjaAvailable.id}, ${rcvVja.id}, ${volVja.id}, 40,
        'accepted', '482910', '719304', false, false,
        ${new Date(now.getTime() + 2 * 3600 * 1000)}
      ) RETURNING id, status, pickup_otp, delivery_otp
    `;

    // Historical Completed Order 1 (Vijayawada)
    const [orderCompletedVja] = await sql`
      INSERT INTO rescue_orders (
        listing_id, receiver_id, volunteer_id, allocated_portions,
        status, pickup_otp, delivery_otp, pickup_otp_consumed, delivery_otp_consumed,
        pickup_deadline, collected_at, delivered_at
      ) VALUES (
        ${listingVjaCompleted.id}, ${rcvVja.id}, ${volVja.id}, 40,
        'delivered', '201948', '593812', true, true,
        ${new Date(now.getTime() - 21 * 3600 * 1000)},
        ${new Date(now.getTime() - 21 * 3600 * 1000)},
        ${new Date(now.getTime() - 20 * 3600 * 1000)}
      ) RETURNING id, status
    `;

    // Historical Completed Order 2 (Hyderabad)
    const [orderCompletedHyd] = await sql`
      INSERT INTO rescue_orders (
        listing_id, receiver_id, volunteer_id, allocated_portions,
        status, pickup_otp, delivery_otp, pickup_otp_consumed, delivery_otp_consumed,
        pickup_deadline, collected_at, delivered_at
      ) VALUES (
        ${listingHydCompleted.id}, ${rcvHyd.id}, ${volHyd.id}, 75,
        'delivered', '849102', '319485', true, true,
        ${new Date(now.getTime() - 45 * 3600 * 1000)},
        ${new Date(now.getTime() - 45 * 3600 * 1000)},
        ${new Date(now.getTime() - 44 * 3600 * 1000)}
      ) RETURNING id, status
    `;

    console.log(`   -> Live In-Flight Order (Vijayawada): ID ${orderLiveVja.id}`);
    console.log(`      Pickup OTP: ${orderLiveVja.pickup_otp} | Delivery OTP: ${orderLiveVja.delivery_otp}`);
    console.log(`   -> Completed Orders: ${orderCompletedVja.id}, ${orderCompletedHyd.id}\n`);

    // 7. Seed Volunteer Credit Ledger
    console.log("7. Seeding volunteer credit ledger entries...");
    await sql`
      INSERT INTO rescue_credit_ledger (
        volunteer_id, order_id, amount, balance_after, type, description
      ) VALUES
      (
        ${volVja.id}, ${orderCompletedVja.id}, 50, 180, 'delivery_completed',
        'Awarded 50 credits for on-time delivery in Vijayawada (Benz Circle to Governorpet)'
      ),
      (
        ${volHyd.id}, ${orderCompletedHyd.id}, 50, 90, 'delivery_completed',
        'Awarded 50 credits for on-time delivery in Hyderabad (Cyber Pearl to Begumpet)'
      )
    `;
    console.log("   -> Credit ledger entries verified and recorded.\n");

    // 8. Seed B2B Pro Monetization & CSR Sponsorship Records
    console.log("8. Seeding commercial B2B Pro subscription and CSR sponsorships...");
    await sql`
      INSERT INTO payment_records (
        user_id, organisation_name, amount, currency, purpose, plan_name,
        status, is_simulated, notes
      ) VALUES
      (
        ${donorVja.id}, ${donorVja.organisation_name}, 49900, 'INR',
        'donor_subscription_pro', 'Pro Waste Analytics', 'paid', true,
        'Active B2B Pro subscription for Krishna Grand Banquets (Vijayawada)'
      ),
      (
        ${donorHyd.id}, ${donorHyd.organisation_name}, 149900, 'INR',
        'donor_subscription_enterprise', 'Enterprise ESG Suite', 'paid', true,
        'Active Enterprise ESG Suite for Paradise Food Court (Hyderabad)'
      ),
      (
        ${donorVzg.id}, ${donorVzg.organisation_name}, 500000, 'INR',
        'csr_sponsorship', 'CSR Rescue Batch (500 Meals)', 'paid', true,
        'Corporate CSR Logistics fund sponsorship for Visakhapatnam Coastal Feeding'
      )
    `;
    console.log("   -> Seeded active B2B Pro subscriptions & CSR sponsorships.\n");

    console.log("==========================================================");
    console.log("✅ All South India Demo Data Seeded Successfully!");
    console.log("   Ready for live hackathon judge presentation.");
    console.log("==========================================================");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
