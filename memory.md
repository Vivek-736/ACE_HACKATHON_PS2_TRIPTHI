# Project Memory — Tripti

## Current project state
- **Current phase:** Phase 0 (Repository foundation & design tokens) and Phase 1 (Authentication, onboarding & role dashboards) are **✅ Complete**.
- **Next phase:** Phase 2 (Donor listings, receiver needs, food metadata & 60-second posting flow).
- **Last updated:** 2026-11-21

## What has been built
1. **Blocking Route Error Resolution:**
   - Resolved Next.js 16 Partial Prerendering blocking route issue on `/sign-in` and `/sign-up`.
   - Placed `<ClerkProvider>` inside `<body>` wrapped in `<Suspense fallback={null}>` in `app/layout.tsx`, resolving the `usePathname()` in client component outside `<Suspense>` error at RootLayout during partial prerendering.
   - Wrapped `<SignIn />` and `<SignUp />` in React `<Suspense>` boundaries with loading fallback.
   - Removed `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"` across all routes, as route segment configs are incompatible with `nextConfig.cacheComponents: true` in Next.js 16.
   - Refactored `app/onboarding/page.tsx`, `app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, and all role dashboard pages (`/volunteer`, `/donor`, `/receiver`, `/admin`) with React `<Suspense>` streaming boundaries and dedicated `loading.tsx` fallbacks to eliminate uncached dynamic data warnings during PPR prefetching.

2. **Phase 0 — Repository Foundation, Database & Design System:**
   - Neon PostgreSQL connection verified via `@neondatabase/serverless` and Drizzle ORM.
   - Live schema pushed via `drizzle-kit push`; initial migration generated at `db/migrations/0000_chubby_boomerang.sql`.
   - Health check endpoint created at `GET /api/health` verifying live database connectivity.
   - Centralised design tokens and sustainability palette in `app/globals.css`.

3. **Phase 1 — Clerk Auth, Role Selection & Role Dashboards:**
   - Root `middleware.ts` configured with `clerkMiddleware` and route protection for private areas.
   - Server-side auto-sync fallback in `lib/auth/current-user.ts` eliminates race conditions between Clerk signup and database records.
   - Role selection flow on `/onboarding`: unassigned users are redirected to select their role right after login.
   - Atomic role assignment via `POST /api/onboarding/role` (Zod validated; only `donor`, `receiver`, or `volunteer` selectable; admin cannot be self-assigned; 409 conflict prevents re-assignment).
   - Root dashboard router (`app/dashboard/page.tsx`): verifies role and automatically directs unassigned users to `/onboarding` and assigned users to their specific console.
   - Dashboard shell layout (`app/dashboard/layout.tsx`) with role indicator badge and Clerk `<UserButton />`.
   - Four dedicated role dashboard consoles:
     - **Donor Console** (`/dashboard/donor`): overview, metric cards, surplus food posting trigger (< 60s), listing lifecycle preview.
     - **Receiver Console** (`/dashboard/receiver`): community distribution metrics, incoming deliveries, OTP handoff preview.
     - **Rescue Volunteer Console** (`/dashboard/volunteer`): availability toggle (online/offline), completed rescues, Rescue Credits ledger preview.
     - **Platform Admin Console** (`/dashboard/admin`): platform metrics, organisation verification queue, audit logging.
   - Updated `components/landing/Navbar.tsx` with Clerk `SignedIn` / `SignedOut` states.
   - Built modern split-screen `app/(auth)/layout.tsx` showcasing Tripti brand narrative, three-sided platform benefits, and trust metrics alongside bespoke Clerk sign-in and sign-up card appearance.

## Database / migrations
- Database: Neon PostgreSQL.
- Schema: `db/schema/users.ts` (`id`, `clerk_id` unique, `email`, `first_name`, `last_name`, `image_url`, `role`, `organisation_name`, `display_name`, `onboarded_at`, timestamps).
- Schema pushed to Neon database.
- Migration file: `db/migrations/0000_chubby_boomerang.sql`.

## Environment variables
- Documented in `.env.example`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding`
  - `DATABASE_URL`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - `NEXT_PUBLIC_APP_URL`

## Verification and tests
- `npx tsc --noEmit` PASSED with 0 errors across the entire codebase.
- Database connection and migration verified against Neon PostgreSQL.
- Protected routes and role boundary checks enforced in middleware and server components.

## Next phase
- **Phase 2:** Donor listings, receiver needs, food metadata, and 60-second donor listing creation flow.
- **Prerequisites:** Phase 0 & 1 complete (satisfied).
- **Reference:** `docs/addons.md` Section "Phase 2 — Donor listings and receiver needs".
