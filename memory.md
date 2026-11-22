# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow), Phase 3 (Location Model, Maps & Route Calculations), Phase 4 (Matching Engine, Claims & Rescue Order Lifecycle), Phase 5 (Volunteer Availability Polling & Delivery Verification), Phase 6 (Background Jobs, Expiry, Notifications & Transactional Email), and Phase 7 (Impact Dashboard, Rescue Credits Ledger, Platform Admin Moderation & Razorpay Checkout/Sponsorship Demo) are **✅ Complete**.
- **Next phase:** Phase 8 (QA, Accessibility, Security, Demo Seed Data & Vercel Deployment).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 7 — Impact, Rescue Credits, Admin Operations & Commercial Monetization
- **Database Schema Additions & Neon Migration (`db/migrations/0006_slow_wither.sql`):**
  - `rescue_credit_ledger` (`db/schema/credits.ts`):
    - `id` (uuid, primary key), `volunteer_id` (foreign key to `users.id` with cascade delete), `order_id` (foreign key to `rescue_orders.id` set null), `amount` (integer), `type` (enum: `delivery_completed`, `on_time_bonus`, `tier_upgrade`, `redemption`, `adjustment`), `description` (text), `balance_after` (integer), `created_at` (timestamp with timezone).
    - Indices: `credit_ledger_volunteer_id_idx`, `credit_ledger_order_id_idx`, `credit_ledger_created_at_idx`.
  - `payment_records` (`db/schema/payments.ts`):
    - `id` (uuid, primary key), `user_id` (foreign key to `users.id`), `organisation_name` (text), `amount` (integer in paise), `currency` (default "INR"), `purpose` (enum: `donor_subscription_pro`, `donor_subscription_enterprise`, `csr_sponsorship`, `priority_clearance_fee`), `plan_name` (text), `status` (enum: `created`, `paid`, `failed`, `refunded`), `is_simulated` (boolean), `razorpay_order_id` (text), `razorpay_payment_id` (text), `notes` (text), timestamps.
    - Indices: `payment_records_user_id_idx`, `payment_records_status_idx`, `payment_records_created_at_idx`.
  - `users` column: `verification_status` (text enum: `unverified`, `pending`, `verified`, `rejected`, default "pending").
  - Successfully migrated to live Neon PostgreSQL via `node scripts/migrate.mjs 0006_slow_wither.sql`.

- **Transparent Environmental & Community Impact Calculation Engine (`lib/impact/engine.ts`):**
  - Strictly derives figures only from verified completed deliveries (`status = 'delivered'`).
  - Standardized portion mass: $1\text{ meal portion} = 0.4\text{ kg}$ (400 grams).
  - Food waste diverted: $\text{delivered portions} \times 0.4\text{ kg}$.
  - Landfill methane averted: $1\text{ kg diverted food waste} \times 2.5\text{ kg CO}_2\text{e}$ (based on UNEP Food Waste Index & FAO Municipal Organic Waste Landfill Methane Emission Factors).
  - Categorical breakdown across Cooked Meals, Bakery, Fresh Produce, Packaged Groceries, and Dairy.
  - Transparent audit callout and printable ESG statement generator for commercial B2B donors.

- **Volunteer Recognition Tiers & Credits Service (`lib/credits/service.ts`):**
  - Recognition Tiers:
    - **Bronze Scout:** 0–199 credits.
    - **Silver Rescuer:** 200–499 credits.
    - **Gold Community Guardian:** 500+ credits.
  - Progress bar and target computation.
  - Idempotent credit awarding logic: guards against duplicate credit awards for the same order and transaction type.
  - Wired into `POST /api/rescue-orders/:id/delivery/verify` to automatically award +50 base credits upon successful delivery OTP confirmation.

- **Commercial Monetization & Razorpay Payment Engine (`lib/payments/service.ts`):**
  - Defined 4 monetization plans:
    1. **Pro Waste Analytics (₹499/mo):** For restaurants and caterers looking to cut kitchen overproduction at the source.
    2. **Enterprise ESG Suite (₹1,499/mo):** For hotels and supermarket chains needing audit-grade Scope 3 reports.
    3. **CSR Rescue Batch Sponsor (₹5,000 / 500 Meals):** Corporate CSR funds directly subsidizing courier logistics and fuel.
    4. **Priority 30-Min Clearance Fee (₹299/event):** For weddings and banquets with strict venue handover deadlines.
  - Always 100% free for community receivers (NGOs/shelters) and volunteers.
  - Zero-crash simulation mode: seamless test mode demonstration when Razorpay keys are in test or development mode.

- **Platform Admin Console & Verification Desk (`app/dashboard/admin/page.tsx`, `components/admin/`):**
  - Restricted strictly to `role === 'admin'` or designated admin email (`vivek338614@gmail.com`).
  - Real-time operational overview: registered users by role, active listings, in-flight orders, CSR fund balances.
  - `AdminVerificationTable`: interactive queue to review, approve, or reject donor restaurants and receiver NGOs with 1 click.
  - Embedded Global Impact View (`<ImpactDashboardView scope="global" />`).

- **UI Components & Integrations:**
  - `components/impact/impact-dashboard-view.tsx`: Responsive sustainability dashboard with 4 KPI cards, category breakdown progress bars, calculation assumptions callout, and recent verified deliveries log. Integrated across Donor, Receiver, and Admin consoles.
  - `components/volunteer/volunteer-credits-card.tsx`: Tier badge, progress percentage bar, total balance, and itemized ledger table integrated into Volunteer Console (`app/dashboard/volunteer/page.tsx`).
  - `components/payments/sponsorship-checkout-modal.tsx`: Interactive checkout dialog with plan cards, simulation banner, 1-click confirmation, and success receipt. Integrated into Donor and Admin headers.

- **API Endpoints Added:**
  - `GET /api/impact/summary`: returns public, donor-specific, or receiver-specific impact stats with transparent assumptions.
  - `GET /api/volunteers/credits`: returns volunteer's tier, progress, and transaction ledger.
  - `GET /api/admin/overview`: returns platform-wide operational KPIs and aggregate stats.
  - `GET /api/admin/organisations`: returns registered donors and receivers with verification statuses.
  - `PATCH /api/admin/organisations/:id/verification`: updates organisation verification status (`verified`, `rejected`, `pending`).
  - `POST /api/payments/checkout`: initiates checkout session.
  - `POST /api/payments/verify`: confirms payment and marks record as paid.

### 2. Previous Phases (Phases 0 - 6)
- **Phase 0:** Foundation, sustainability design tokens in `app/globals.css`, Neon database & Drizzle ORM.
- **Phase 1:** Clerk auth, role onboarding (`/onboarding`), split-screen auth, and role dashboards.
- **Phase 2:** Donor listings (<60s flow), receiver needs, food metadata, safety notices, and capacity manager.
- **Phase 3:** Spatial location model, Haversine distance, Google Maps JS SDK integration, custom role markers, and dual-view radar.
- **Phase 4:** Deterministic 4-dimension matching engine, conditional claiming, OTP generation, order lifecycle, and dispatch dialog.
- **Phase 5:** TanStack Query polling (10-12s), OTP replay prevention & 5-attempt rate-limit locking, dedicated verification endpoints, and delivery truck transport mode.
- **Phase 6:** Trigger.dev SDK v4 background jobs, automated listing expiry, Nodemailer transactional email delivery, persistent in-app notifications, and `NotificationBell` UI.

## Database / migrations
- Database: Neon PostgreSQL.
- Migrations applied:
  - `0000_chubby_boomerang.sql` (`users`)
  - `0001_majestic_domino.sql` (`food_listings`, `food_requests`, `listing_reservations`, `receiver_profiles`)
  - `0002_happy_next_avengers.sql` (`volunteer_profiles`)
  - `0003_aromatic_firelord.sql` (`rescue_orders`, `delivery_events`)
  - `0004_mushy_amazoness.sql` (`rescue_orders` columns: `pickup_otp_consumed`, `delivery_otp_consumed`, `pickup_attempts`, `delivery_attempts`)
  - `0005_certain_squadron_sinister.sql` (`notifications` table with user and created_at indices)
  - `0006_slow_wither.sql` (`rescue_credit_ledger` table, `payment_records` table, `users.verification_status` column)
- Live tables and schema columns verified.

## Verification and tests
- `scripts/test-phase7.mjs`: 39 tests covering Impact formulas ($1\text{ portion} = 0.4\text{ kg}$, $1\text{ kg waste} = 2.5\text{ kg CO}_2\text{e}$), volunteer tiers (Bronze, Silver, Gold), schema columns, credit ledger idempotency, monetization plans, and admin authorization PASSED (0 failures).
- `scripts/test-phase6.mjs`: 9 tests covering Notifications schema, Claimed/Reminder/Delivery/Expired email templates, Nodemailer simulation fallback, Trigger.dev tasks, Expiry sweep functions, and NotificationBell polling UI PASSED (0 failures).
- `scripts/test-phase5.mjs`: 27 tests covering Query key factories, schema replay protection columns, attempt counting, 5-attempt rate-limit locking, replay prevention, and credit awards PASSED (0 failures).
- `scripts/test-phase4.mjs`: 25 unit, matching engine, dietary constraint, OTP verification, and order schema tests PASSED (0 failures).
- `scripts/test-phase3.mjs`: 15 spatial, Haversine, ETA, and volunteer validation tests PASSED (0 failures).
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (0 failures).
- `npx tsc --noEmit`: Typecheck passes cleanly with 0 errors across the entire codebase.
- `npm run build`: Production build (`next build --webpack`) PASSED with all 32 static, dynamic API, and partially prerendered dashboard routes.

## Next phase
- **Phase 8:** Testing, accessibility & screen reader audit, demo seed data and deployment.
- **Prerequisites:** Phase 7 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 8 — QA, accessibility, security, demo and deployment".
