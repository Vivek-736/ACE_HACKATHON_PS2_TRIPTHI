# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), and Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow) are **✅ Complete**.
- **Next phase:** Phase 3 (Location model, maps and route calculations).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 2 — Donor Listings, Receiver Needs, Food Metadata & 60-Second Flow
- **Data Model & Schema:**
  - `food_listings` table: `id`, `donor_id`, `organisation_name`, `title`, `food_category`, `diet_type`, `quantity_portions`, `remaining_portions`, `weight_kg`, `prepared_at`, `pickup_by`, `storage_instructions`, `allergen_info`, `handling_notes`, `location_name`, `latitude`, `longitude`, `status`, timestamps.
  - `food_requests` table: `id`, `receiver_id`, `organisation_name`, `title`, `requested_portions`, `food_preferences`, `dietary_constraints`, `needed_by`, `preferred_radius_km`, `location_name`, `latitude`, `longitude`, `status`, timestamps.
  - `listing_reservations` table: `id`, `listing_id`, `receiver_id`, `portions_reserved`, `notes`, `status`, timestamps.
  - `receiver_profiles` table: `id`, `user_id` (unique), `daily_capacity_portions`, `current_capacity_portions`, `dietary_preferences`, `service_radius_km`, `operating_hours`, timestamps.
  - Applied migration `db/migrations/0001_majestic_domino.sql` to Neon PostgreSQL. All tables verified live in `information_schema.tables`.

- **Constants & Safety Framework:**
  - `lib/constants/demo-locations.ts`: 7 safe synthetic demo points across Hyderabad (Madhapur, Gachibowli, Banjara Hills, Jubilee Hills, Kondapur, Begumpet, Secunderabad) with fixed coordinates to prevent publishing real personal addresses.
  - `lib/constants/food-safety.ts`: non-negotiable food safety notice, disclaimer, allergen options (dairy, gluten, nuts, soy, eggs, mustard, sesame, none), storage presets (`hot_holding`, `refrigerated`, `room_temperature`, `frozen`), and category/diet presets. Explicitly communicates that the platform does not certify food as safe.
  - `lib/api/response.ts`: standardized `apiSuccess` and `apiError` helpers complying with the project API contract.

- **Validation & Business Logic:**
  - `lib/validations/listing.ts`: Zod validation for surplus listings ensuring positive integer portions, future `pickupBy`, `preparedAt <= pickupBy`, mandatory storage instructions, and mandatory allergen declaration.
  - `lib/validations/request.ts`: Zod validation for receiver food requests, reservation intents, and capacity limits.

- **API Route Handlers:**
  - `POST /api/listings`: create surplus food listing (<60s flow, donor/admin role check, attaches org metadata).
  - `GET /api/listings`: filter listings by status, category, diet, donorId, and active window.
  - `GET /api/listings/[id]`: retrieve listing details with donor org, active reservations, and safety disclaimer.
  - `PATCH /api/listings/[id]`: update listing details with ownership check (critical edits blocked if already in rescue/completed).
  - `POST /api/listings/[id]/cancel`: cancel listing with ownership verification.
  - `POST /api/listings/[id]/requests`: receiver reservation intent with capacity verification, remaining portion bounds check, atomic quantity decrement, and listing state transition to `reserved` when fully allocated.
  - `POST /api/food-requests`: receiver creates an active surplus food request.
  - `GET /api/food-requests`: fetch active food requests.
  - `PATCH /api/food-requests/[id]`: update/cancel food requests.
  - `GET /api/receiver/profile`: get receiver profile & capacity (auto-initializes defaults if new).
  - `PUT /api/receiver/profile`: update daily capacity, current available capacity, dietary preferences, and radius.

- **Donor Experience & UI Components:**
  - `components/donor/quick-post-dialog.tsx`: single-page quick-post modal with 1-click presets (Biryani & Curry, Rice & Dal, Fresh Roti, Bakery Breads), portion shortcuts, time presets, storage selector, allergen badges, demo location selector, and prominent food safety disclaimer. Enables creating listings in under 60 seconds.
  - `components/donor/donor-listings-table.tsx`: live management console with status badges (`AVAILABLE`, `RESERVED`, `IN_RESCUE`, `COMPLETED`, `CANCELLED`, `EXPIRED`), remaining portions countdown, storage & allergen details, and cancellation action.
  - Updated `app/dashboard/donor/page.tsx` with live database metrics, donor listings table, and impact calculations (0.42 kg waste avoided & 0.84 kg CO₂e avoided per meal portion).

- **Receiver Experience & UI Components:**
  - `components/receiver/discover-food-view.tsx`: live discovery grid with category and dietary filters, storage and allergen tags, pickup window countdown, and a quick-reservation modal enforcing receiver capacity limits.
  - `components/receiver/capacity-manager.tsx`: capacity utilization progress bar and modal to update daily capacity and dietary constraints.
  - `components/receiver/post-food-request-dialog.tsx`: modal to submit surplus needs to alert nearby donors.
  - `components/receiver/receiver-requests-table.tsx`: live table tracking active receiver needs and reservations.
  - Updated `app/dashboard/receiver/page.tsx` integrating capacity manager, discovery grid, and requests ledger.

### 2. Previous Phases (Phase 0 & 1)
- Next.js 16 Partial Prerendering and Clerk auth integration (`/sign-in`, `/sign-up`, `/onboarding`).
- Split-screen auth layout and marketing landing page with centralized design tokens in `app/globals.css`.
- Dedicated role dashboard shells (`/dashboard/*`).

## Database / migrations
- Database: Neon PostgreSQL.
- Migration files:
  - `db/migrations/0000_chubby_boomerang.sql` (`users` table).
  - `db/migrations/0001_majestic_domino.sql` (`food_listings`, `food_requests`, `listing_reservations`, `receiver_profiles` tables and foreign key constraints).
- Applied and verified against live Neon database.

## Environment variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding`
- `DATABASE_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `.env.example` created and committed with safe placeholders.

## Verification and tests
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (listing validation, expired pickup rejection, invalid preparation time rejection, zero portion rejection, mandatory allergen check, food request validation, past needed-by rejection, reservation validation, capacity check).
- `npx tsc --noEmit`: PASSED with 0 errors across the entire codebase.
- `npm run build`: PASSED (production build with webpack successfully generated static and partially prerendered routes).

## Known issues / limitations
- Real-time notification/expiry background tasks deferred to Phase 6 (Trigger.dev). Active views use TanStack polling and query refetch patterns.
- Map visualization and route calculations are synthetic in this phase; integrated in Phase 3.

## Next phase
- **Phase 3:** Neon/PostGIS location model, Google Maps JavaScript API, Places and Routes calculations.
- **Prerequisites:** Phase 2 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 3 — Location model, maps and route calculations".
