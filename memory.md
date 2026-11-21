# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow), Phase 3 (Location Model, Maps & Route Calculations), and Phase 4 (Matching Engine, Claims & Rescue Order Lifecycle) are **✅ Complete**.
- **Next phase:** Phase 5 (Volunteer availability polling and delivery verification).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 4 — Matching Engine, Assignment and Rescue Order Lifecycle
- **Data Model & Schema (`db/schema/orders.ts`):**
  - `rescue_orders`: `id`, `listing_id`, `receiver_id`, `volunteer_id` (nullable), `allocated_portions`, `status` (`pending`, `accepted`, `at_pickup`, `collected`, `at_receiver`, `delivered`, `declined`, `cancelled`, `failed`), `pickup_otp`, `delivery_otp`, `pickup_deadline`, `collected_at`, `delivered_at`, `cancellation_reason`, `match_score`, timestamps.
  - `delivery_events`: `id`, `order_id`, `event_type` (`order_created`, `assignment_offered`, `assignment_accepted`, `assignment_declined`, `arrived_at_pickup`, `food_collected`, `arrived_at_receiver`, `food_delivered`, `order_cancelled`, `order_reassigned`), `actor_id`, `actor_role`, `notes`, `proof_photo_url`, `created_at`.
  - Applied migration `db/migrations/0003_aromatic_firelord.sql` to Neon PostgreSQL. All tables verified live in `information_schema.tables`.

- **Deterministic Matching Engine (`lib/matching/`):**
  - `lib/matching/engine.ts`:
    - Hard eligibility filters: active and unexpired listings (`pickup_by > now`), remaining portion availability, receiver remaining capacity, dietary compatibility (`checkDietaryCompatibility` ensuring strict vegan, vegetarian, halal, and jain rules), volunteer duty availability, volunteer preferred rescue radius, and feasibility of transit before pickup deadline.
    - Deterministic 4-dimension scoring: `0.35 * distanceSuitability + 0.25 * urgencySuitability + 0.20 * reliability + 0.20 * receiverNeedSuitability`.
    - Non-overriding Rescue Credit tie-breaker bonus (max +5 points).
    - Normalized 0-100 score calculation with human-readable explainable rationale.
  - `lib/orders/otp.ts`: secure 4-digit numeric OTP generation (`generateHandoffOtp`) and verification (`verifyHandoffOtp`) for physical handshakes.
  - `lib/validations/order.ts`: Zod validation schemas for order creation and state transitions (enforces mandatory OTP for `collected` and `delivered` milestones).

- **API Route Handlers:**
  - `POST /api/matching/listings/[listingId]/run`: evaluates candidate receivers and available volunteers, computes match scores and transit times, and returns ranked candidates.
  - `GET /api/matching/listings/[listingId]/results`: returns ranked match results for dispatch.
  - `POST /api/rescue-orders`: atomic order creation; validates remaining portions; decrements portions & receiver capacity; generates `pickupOtp` and `deliveryOtp`; audits `order_created`.
  - `GET /api/rescue-orders`: lists orders with role-based filtering (donors see their listings' orders, receivers see their claims, volunteers see assigned or open orders; masks OTPs so donors only see `pickupOtp` and receivers only see `deliveryOtp`).
  - `GET /api/rescue-orders/[id]`: order detail with full delivery events timeline and role-filtered OTPs.
  - `POST /api/rescue-orders/[id]/accept`: volunteer claims assignment with atomic conditional update (`WHERE id = id AND status = 'pending'`); returns 409 Conflict if claimed by another volunteer.
  - `POST /api/rescue-orders/[id]/decline`: volunteer declines assignment; returns order to pending dispatch queue.
  - `POST /api/rescue-orders/[id]/cancel`: participant cancellation; restores remaining portions to listing and receiver capacity if not yet collected; releases volunteer.
  - `POST /api/rescue-orders/[id]/transition`: typed state transitions (`accepted` -> `at_pickup` -> `collected` with pickup OTP -> `at_receiver` -> `delivered` with delivery OTP); awards +50 Rescue Credits on completion and logs immutable audit trail in `delivery_events`.

- **UI Components & Workflows:**
  - `components/donor/matching-dispatch-dialog.tsx`: interactive dispatch dialog on Donor Dashboard; allows running the matching engine on any surplus listing, viewing ranked receivers & volunteers with score breakdown cards, and 1-click dispatching.
  - `components/volunteer/volunteer-order-console.tsx`: live volunteer console with active delivery stepper (`ACCEPTED` -> `AT PICKUP` -> `COLLECTED` -> `AT RECEIVER` -> `DELIVERED`), status action buttons, OTP verification dialogs, and available rescue opportunities list.
  - `components/orders/order-tracking-card.tsx`: active orders card for Donor and Receiver dashboards; displays live volunteer courier status and prominently reveals the physical verification OTP (`pickupOtp` for Donors, `deliveryOtp` for Receivers).
  - Integrated across **Donor Dashboard** (`app/dashboard/donor/page.tsx`), **Receiver Dashboard** (`app/dashboard/receiver/page.tsx`), and **Volunteer Dashboard** (`app/dashboard/volunteer/page.tsx`).

### 2. Previous Phases (Phases 0 - 3)
- Phase 0: Foundation, sustainability design tokens in `app/globals.css`, Neon database & Drizzle ORM.
- Phase 1: Clerk auth, role onboarding (`/onboarding`), split-screen auth, and role dashboards.
- Phase 2: Donor listings (<60s flow), receiver needs, food metadata, safety notices, and capacity manager.
- Phase 3: Spatial location model, Haversine distance, Google Maps JS SDK integration, custom role markers, and dual-view radar.

## Database / migrations
- Database: Neon PostgreSQL.
- Migrations:
  - `0000_chubby_boomerang.sql` (`users`)
  - `0001_majestic_domino.sql` (`food_listings`, `food_requests`, `listing_reservations`, `receiver_profiles`)
  - `0002_happy_next_avengers.sql` (`volunteer_profiles`)
  - `0003_aromatic_firelord.sql` (`rescue_orders`, `delivery_events`)
- Live tables verified in `information_schema.tables`.

## Verification and tests
- `scripts/test-phase4.mjs`: 25 unit, matching engine, dietary constraint, OTP verification, and order schema tests PASSED (0 failures).
- `scripts/test-phase3.mjs`: 15 spatial, Haversine, ETA, and volunteer validation tests PASSED (0 failures).
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (0 failures).
- `npx tsc --noEmit`: Typecheck passes cleanly with 0 errors across the entire codebase.
- `npm run build`: Production build (`next build --webpack`) PASSED with all static, dynamic API, and partially prerendered dashboard routes.

## Next phase
- **Phase 5:** Volunteer availability polling and delivery verification.
- **Prerequisites:** Phase 4 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 5 — Volunteer availability polling and delivery verification".
