# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow), Phase 3 (Location Model, Maps & Route Calculations), Phase 4 (Matching Engine, Claims & Rescue Order Lifecycle), and Phase 5 (Volunteer Availability Polling & Delivery Verification) are **✅ Complete**.
- **Next phase:** Phase 6 (Trigger.dev, email, expiry and notifications).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 5 — Volunteer Availability Polling and Delivery Verification
- **Architecture & Dependencies:**
  - Installed and configured `@tanstack/react-query@^5.108.2`.
  - `lib/query/query-client.ts`: Singleton `makeQueryClient` / `getQueryClient` with `staleTime: 10s`, `refetchInterval: 12s`, `refetchOnWindowFocus: true`, `refetchIntervalInBackground: false`.
  - `lib/query/query-keys.ts`: Structured query key factories (`orders`, `volunteers`, `map`, `listings`, `receiver`).
  - `components/providers/query-provider.tsx`: `<QueryProvider>` wrapping application tree inside RootLayout (`app/layout.tsx`).

- **Database Migration (`db/migrations/0004_mushy_amazoness.sql`):**
  - Updated `rescue_orders` schema (`db/schema/orders.ts`) with:
    - `pickup_otp_consumed` (boolean, default false): prevents reuse of pickup OTP.
    - `delivery_otp_consumed` (boolean, default false): prevents reuse of delivery OTP.
    - `pickup_attempts` (integer, default 0): tracks failed pickup OTP entries.
    - `delivery_attempts` (integer, default 0): tracks failed delivery OTP entries.
  - Successfully executed migration against live Neon PostgreSQL over HTTP client.

- **Dedicated Verification API Endpoints:**
  - `POST /api/rescue-orders/:id/pickup/verify`:
    - Validates assigned volunteer or admin identity.
    - Validates state precondition (`status === 'at_pickup'`).
    - Enforces brute-force rate limit (max 5 failed attempts, locking with 429 `TOO_MANY_ATTEMPTS`).
    - Enforces replay protection (rejects already-consumed OTPs with 409 `ALREADY_VERIFIED`).
    - Advances order to `collected`, updates listing to `in_rescue`, sets `pickupOtpConsumed = true`, and logs audit record in `delivery_events`.
  - `POST /api/rescue-orders/:id/delivery/verify`:
    - Validates assigned volunteer or admin identity.
    - Validates state precondition (`status === 'at_receiver'`).
    - Enforces brute-force rate limit (max 5 failed attempts, locking with 429 `TOO_MANY_ATTEMPTS`).
    - Enforces replay protection (rejects already-consumed OTPs with 409 `ALREADY_VERIFIED`).
    - Advances order to `delivered`, updates listing to `completed`, sets `deliveryOtpConsumed = true`, awards +50 Rescue Credits, and logs audit record in `delivery_events`.

- **Custom Reactive Hooks & UI Components:**
  - `hooks/use-polling-query.ts`: Generic polling hook with smart tab visibility handling (`document.visibilityState`), auto-pausing when tab is hidden and refetching immediately upon tab activation; provides `lastUpdated` timestamp and human-friendly `timeAgoText`.
  - `hooks/use-volunteer-availability.ts`: 12s polling query for volunteer profiles, with optimistic availability toggle (`available` ↔ `offline`) and immediate query invalidation of profile, availability, and map markers.
  - `hooks/use-active-orders.ts`: 10s polling query for active orders, with built-in mutations for `acceptOrder`, `declineOrder`, `transitionOrder`, `verifyPickup`, and `verifyDelivery`, each automatically triggering multi-query cache invalidation.
  - `components/shared/live-status-indicator.tsx`: Responsive live status badge with animated green live pulse, stale data warning, offline/error retry indicator, and manual sync action.
  - Updated `components/volunteer/volunteer-order-console.tsx` to use `useActiveOrders`, replace manual `setInterval`, integrate `LiveStatusIndicator`, and trigger dedicated `/pickup/verify` and `/delivery/verify` endpoints.
  - Updated `components/orders/order-tracking-card.tsx` to use `useActiveOrders` with `LiveStatusIndicator`.
  - Updated `components/volunteer/volunteer-location-widget.tsx` to use `useVolunteerAvailability` with optimistic toggle and strict adherence to semantic color tokens.
  - Added `delivery_truck` to `TRANSPORT_MODES` in `db/schema/volunteers.ts` and `lib/maps/haversine.ts`, updating the volunteer dashboard widget with a dedicated `Truck` icon and responsive 5-column layout.
  - Resolved availability toggle momentary rollback issue by unwrapping nested API payloads (`json.data?.profile ?? json.data`) in `hooks/use-volunteer-availability.ts` and harmonizing API return contracts in `/api/volunteers/profile` and `/api/volunteers/availability`.

### 2. Previous Phases (Phases 0 - 4)
- **Phase 0:** Foundation, sustainability design tokens in `app/globals.css`, Neon database & Drizzle ORM.
- **Phase 1:** Clerk auth, role onboarding (`/onboarding`), split-screen auth, and role dashboards.
- **Phase 2:** Donor listings (<60s flow), receiver needs, food metadata, safety notices, and capacity manager.
- **Phase 3:** Spatial location model, Haversine distance, Google Maps JS SDK integration, custom role markers, and dual-view radar.
- **Phase 4:** Deterministic 4-dimension matching engine, conditional claiming, OTP generation, order lifecycle, and dispatch dialog.

## Database / migrations
- Database: Neon PostgreSQL.
- Migrations applied:
  - `0000_chubby_boomerang.sql` (`users`)
  - `0001_majestic_domino.sql` (`food_listings`, `food_requests`, `listing_reservations`, `receiver_profiles`)
  - `0002_happy_next_avengers.sql` (`volunteer_profiles`)
  - `0003_aromatic_firelord.sql` (`rescue_orders`, `delivery_events`)
  - `0004_mushy_amazoness.sql` (`rescue_orders` columns: `pickup_otp_consumed`, `delivery_otp_consumed`, `pickup_attempts`, `delivery_attempts`)
- Live tables and schema columns verified.

## Verification and tests
- `scripts/test-phase5.mjs`: 27 tests covering Query key factories, schema replay protection columns, attempt counting, 5-attempt rate-limit locking (429), replay prevention (409), delivery verification, and credit awards PASSED (0 failures).
- `scripts/test-phase4.mjs`: 25 unit, matching engine, dietary constraint, OTP verification, and order schema tests PASSED (0 failures).
- `scripts/test-phase3.mjs`: 15 spatial, Haversine, ETA, and volunteer validation tests PASSED (0 failures).
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (0 failures).
- `npx tsc --noEmit`: Typecheck passes cleanly with 0 errors across the entire codebase.
- `npm run build`: Production build (`next build --webpack`) PASSED with all static, dynamic API, and partially prerendered dashboard routes.

## Next phase
- **Phase 6:** Trigger.dev, email, expiry and notifications.
- **Prerequisites:** Phase 5 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 6 — Trigger.dev, email, expiry and notifications".
