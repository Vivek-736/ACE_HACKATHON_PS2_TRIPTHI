# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow), and Phase 3 (Location Model, Maps & Route Calculations) are **✅ Complete**.
- **Next phase:** Phase 4 (Matching engine, claims and rescue order lifecycle).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 3 — Location Model, Google Maps & Route Calculations
- **Data Model & Schema:**
  - `volunteer_profiles` table: `id`, `user_id` (unique fk to `users`), `availability_status` (`available`, `busy`, `offline`), `preferred_radius_km`, `transport_mode` (`bicycle`, `motorcycle`, `car`, `on_foot`), `location_name`, `latitude`, `longitude`, `rescue_credits`, `total_deliveries`, `on_time_rate`, `location_updated_at`, timestamps.
  - Live migration applied to Neon PostgreSQL via `drizzle-kit push` and migration `db/migrations/0002_happy_next_avengers.sql`.
- **Spatial Calculations & Utilities (`lib/maps/`):**
  - `lib/maps/haversine.ts`: spherical Haversine distance formula (`calculateHaversineDistanceKm`), radius testing (`isWithinRadius`), bounding box computation (`calculateBoundingBox`), and ground transport speed/ETA calculation (`estimateTravelTimeMinutes`) factoring in urban traffic buffers.
  - `lib/maps/types.ts`: typed contracts for `MapMarker`, `RouteSummary`, `NearbyCandidate`, and `LatLng`.
  - `lib/maps/map-styles.ts`: custom Google Maps JSON styles aligned with Tripti's warm ivory canvas and forest/leaf palette (`TRIPTI_MAP_STYLES`), and role/status marker semantics (`ROLE_MARKER_COLORS`).
  - `lib/maps/use-google-maps.ts`: asynchronous browser loader hook for Google Maps JavaScript SDK (with `places` and `routes` libraries) supporting graceful fallbacks for missing/unauthorized API keys without crashing the UI.
- **API Route Handlers:**
  - `GET /api/map/markers`: aggregates active surplus listings, open receiver requests, and available volunteers; filters by radius and role; applies privacy masking (synthetic demo locations, no personal contact details).
  - `GET /api/locations/nearby`: proximity candidate shortlisting and travel time estimations for dispatch.
  - `GET /api/volunteers/profile`: auto-initializes and fetches authenticated volunteer profile.
  - `PATCH /api/volunteers/location`: updates staging location, coordinates, radius, and transport mode.
  - `PATCH /api/volunteers/availability`: toggles volunteer dispatch status (`available` ↔ `offline`).
- **Map Components & Dashboards (`components/maps/`):**
  - `components/maps/rescue-map.tsx`: interactive Google Map with custom SVG role pin icons (🍽️ Donors, 🏠 Receivers, 🚴 Volunteers with status color badges), click InfoWindows, and dynamic route rendering via Google `DirectionsService` & `DirectionsRenderer`. Features an animated fallback radar visualization when offline or without an API key.
  - `components/maps/route-card.tsx`: displays route preview, driving distance, ETA in minutes, and safety handoff checks.
  - `components/maps/map-dual-view.tsx`: accessible toggle between interactive Map View and List View, with role filtering and distance badges.
  - `components/volunteer/volunteer-location-widget.tsx`: duty status toggle, staging zone selector, and transport mode chooser with instantaneous database sync.
  - Integrated into **Volunteer Dashboard** (`app/dashboard/volunteer/page.tsx`), **Receiver Dashboard** (`app/dashboard/receiver/page.tsx`), and **Donor Dashboard** (`app/dashboard/donor/page.tsx`).

### 2. Phase 2 — Donor Listings, Receiver Needs, Food Metadata & 60-Second Flow
- Single-page quick post modal (`QuickPostDialog`) with 1-click meal presets, portion buttons, storage requirements, mandatory allergen declarations, and non-negotiable food safety notice.
- `food_listings`, `food_requests`, `listing_reservations`, and `receiver_profiles` tables.
- Capacity manager and food discovery grid on Receiver console.

### 3. Previous Phases (Phase 0 & 1)
- Next.js 16 Partial Prerendering and Clerk auth integration (`/sign-in`, `/sign-up`, `/onboarding`).
- Split-screen auth layout and marketing landing page with centralized design tokens in `app/globals.css`.
- Dedicated role dashboard shells (`/dashboard/*`).

## Verification and tests
- `scripts/test-phase3.mjs`: 15 spatial, location, Haversine, ETA, and volunteer validation tests PASSED (0 failures).
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (0 failures).
- `npx tsc --noEmit`: Typecheck passes cleanly with 0 errors across the entire codebase.

## Next phase
- **Phase 4:** Matching engine, assignment and rescue order lifecycle.
- **Prerequisites:** Phase 3 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 4 — Matching engine, assignment and rescue order lifecycle".
