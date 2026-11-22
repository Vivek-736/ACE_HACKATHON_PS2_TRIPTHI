# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Foundation & Tokens), Phase 1 (Auth, Onboarding & Role Dashboards), Phase 2 (Donor Listings, Receiver Needs & <60s Posting Flow), Phase 3 (Location Model, Maps & Route Calculations), Phase 4 (Matching Engine, Claims & Rescue Order Lifecycle), Phase 5 (Volunteer Availability Polling & Delivery Verification), and Phase 6 (Background Jobs, Expiry, Notifications & Transactional Email) are **✅ Complete**.
- **Next phase:** Phase 7 (Impact Dashboard, Rescue Credits Ledger, Platform Admin Moderation & Razorpay Checkout/Sponsorship Demo).
- **Last updated:** 2026-11-22

## What has been built

### 1. Phase 6 — Background Jobs, Expiry, Notifications & Transactional Email
- **Database Schema & Neon Migration (`db/migrations/0005_certain_squadron_sinister.sql`):**
  - Created `notifications` table (`db/schema/notifications.ts`):
    - `id` (uuid, primary key)
    - `userId` (uuid, foreign key referencing `users.id` with CASCADE delete)
    - `type` (text enum: `listing_claimed`, `order_assigned`, `at_pickup`, `food_collected`, `at_receiver`, `food_delivered`, `listing_expired`, `volunteer_reminder`, `urgent_surplus`, `system_alert`)
    - `title` (text), `message` (text), `link` (text, optional route link)
    - `read` (boolean, default false)
    - `channel` (text enum: `in_app`, `email`, `both`)
    - `createdAt` (timestamp with timezone, default now)
    - Indices: `notifications_user_id_idx` on `user_id` and `notifications_created_at_idx` on `created_at`.
  - Pushed migration directly to live Neon PostgreSQL via `drizzle-kit push`.

- **Nodemailer Transactional Email Engine (`lib/email/`):**
  - `lib/email/client.ts`: Nodemailer transporter with support for custom SMTP or standard Gmail via `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`.
  - Includes a zero-crash simulation fallback: if credentials are unset or network is offline during dev, emails log cleanly with structured details (`[Tripti Email Service - Simulation Mode]`) and return `{ success: true, simulated: true, messageId: ... }`.
  - `lib/email/templates.ts`: Responsive HTML transactional email templates styled with Tripti's sustainability design tokens (`#1b4332` forest green, `#95d5b2` leaf green, `#fbfbfa` ivory canvas) and mandatory food safety disclaimer:
    - `generateListingClaimedEmail`: Sent to donor when surplus is claimed, including the 4-digit pickup OTP and receiver organisation.
    - `generateVolunteerReminderEmail`: Sent to courier 45 mins before pickup deadline with pickup and dropoff destinations.
    - `generateDeliveryCompletedEmail`: Sent to donor and receiver upon verified delivery, displaying verified meals saved and estimated CO₂e avoided.
    - `generateListingExpiredEmail`: Sent to donor if food reached pickup deadline without being claimed, confirming safe closure.

- **Notification Service & Lifecycle Integration:**
  - `lib/notifications/service.ts`: Centralized service with `createNotification`, `getUserNotifications`, `getUnreadNotificationCount`, `markNotificationAsRead`, and `markAllNotificationsAsRead`.
  - Integrated into order lifecycle route handlers:
    - `POST /api/rescue-orders`: Dispatches `listing_claimed` notification & email to donor with pickup OTP, and `order_assigned` to volunteer if assigned.
    - `POST /api/rescue-orders/:id/accept`: Dispatches `order_assigned` notification to donor and receiver when courier accepts mission.
    - `POST /api/rescue-orders/:id/pickup/verify`: Dispatches `food_collected` notifications to donor and receiver.
    - `POST /api/rescue-orders/:id/delivery/verify`: Dispatches `food_delivered` notifications & celebratory impact emails to donor and receiver, plus +50 Rescue Credits notice to volunteer.

- **Background Jobs & Expiry Sweeper (`lib/jobs/expiry.ts`, `trigger/`, `app/api/jobs/expiry`):**
  - `processListingExpiry()`: Sweeps `food_listings` for items where `status = 'available'` and `pickup_by < NOW()`, atomically marks them `status = 'expired'`, and dispatches safety notification & email to donor.
  - `processVolunteerReminders()`: Identifies active rescue missions (`pending`, `accepted`) where `pickupDeadline <= NOW() + 45 minutes`, dispatching reminder notifications & emails to couriers.
  - `trigger/expire-listings.ts`: Trigger.dev SDK v4 task definition for listing expiry sweep.
  - `trigger/volunteer-reminder.ts`: Trigger.dev SDK v4 task definition for courier deadline reminders.
  - `POST /api/jobs/expiry`: HTTP runner endpoint protected by optional `CRON_SECRET` for cron jobs, Trigger.dev webhooks, or manual admin sweeps.

- **In-App Notification Center UI:**
  - `components/notifications/notification-bell.tsx`:
    - Responsive bell button in dashboard console header (`app/dashboard/layout.tsx`).
    - Unread notification count badge with `9+` display.
    - 12s polling query via TanStack Query (`["notifications"]`) with window focus refetching.
    - Interactive dropdown popover with type-based iconography, relative time format, empty and loading states.
    - Individual "click to read and navigate" and "Mark all read" actions with immediate query invalidation.
  - API Routes:
    - `GET /api/notifications`: Fetches user notifications and unread count.
    - `PATCH /api/notifications/:id/read`: Marks single notification as read.
    - `POST /api/notifications/mark-all-read`: Marks all unread notifications as read.

### 2. Previous Phases (Phases 0 - 5)
- **Phase 0:** Foundation, sustainability design tokens in `app/globals.css`, Neon database & Drizzle ORM.
- **Phase 1:** Clerk auth, role onboarding (`/onboarding`), split-screen auth, and role dashboards.
- **Phase 2:** Donor listings (<60s flow), receiver needs, food metadata, safety notices, and capacity manager.
- **Phase 3:** Spatial location model, Haversine distance, Google Maps JS SDK integration, custom role markers, and dual-view radar.
- **Phase 4:** Deterministic 4-dimension matching engine, conditional claiming, OTP generation, order lifecycle, and dispatch dialog.
- **Phase 5:** TanStack Query polling (10-12s), OTP replay prevention & 5-attempt rate-limit locking, dedicated verification endpoints, and delivery truck transport mode.

## Database / migrations
- Database: Neon PostgreSQL.
- Migrations applied:
  - `0000_chubby_boomerang.sql` (`users`)
  - `0001_majestic_domino.sql` (`food_listings`, `food_requests`, `listing_reservations`, `receiver_profiles`)
  - `0002_happy_next_avengers.sql` (`volunteer_profiles`)
  - `0003_aromatic_firelord.sql` (`rescue_orders`, `delivery_events`)
  - `0004_mushy_amazoness.sql` (`rescue_orders` columns: `pickup_otp_consumed`, `delivery_otp_consumed`, `pickup_attempts`, `delivery_attempts`)
  - `0005_certain_squadron_sinister.sql` (`notifications` table with user and created_at indices)
- Live tables and schema columns verified.

## Verification and tests
- `scripts/test-phase6.mjs`: 9 tests covering Notifications schema, Claimed/Reminder/Delivery/Expired email templates, Nodemailer simulation fallback, Trigger.dev tasks, Expiry sweep functions, and NotificationBell polling UI PASSED (0 failures).
- `scripts/test-phase5.mjs`: 27 tests covering Query key factories, schema replay protection columns, attempt counting, 5-attempt rate-limit locking, replay prevention, and credit awards PASSED (0 failures).
- `scripts/test-phase4.mjs`: 25 unit, matching engine, dietary constraint, OTP verification, and order schema tests PASSED (0 failures).
- `scripts/test-phase3.mjs`: 15 spatial, Haversine, ETA, and volunteer validation tests PASSED (0 failures).
- `scripts/test-phase2.mjs`: 11 business rules and validation tests PASSED (0 failures).
- `npx tsc --noEmit`: Typecheck passes cleanly with 0 errors across the entire codebase.

## Next phase
- **Phase 7:** Impact dashboard (meals saved, waste avoided, CO₂e averted with visible calculation assumptions), Rescue Credits ledger, Platform Admin moderation & dispute desk, Razorpay test mode/sponsorship checkout.
- **Prerequisites:** Phase 6 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 7 — Impact, Rescue Credits, admin and business model".
