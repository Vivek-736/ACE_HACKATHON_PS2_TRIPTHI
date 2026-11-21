# Add-ons & Phase Implementation Playbook

> This is the detailed build specification. **Before starting any phase or vertical slice, read its complete section here.** Follow [`../AGENTS.md`](../AGENTS.md) and track overall progress in [`scope.md`](scope.md). Update root `memory.md` after every completed phase.

## How to use this document

For each phase:
1. Read the objective, prerequisites, recommended skills, environment variables, implementation slices, API contracts, data changes, tests and acceptance criteria.
2. Confirm required external accounts and credentials exist.
3. Install/read the relevant agent skills for the tools actually used. Do not install every skill at once.
4. Inspect current repository state and latest `memory.md`.
5. Implement a small end-to-end vertical slice.
6. Run checks, update this file and `scope.md`, then update root `memory.md`.

### Skill installation guidance

“Skills” here means the coding-agent instruction packs or official documentation skills available in the developer's chosen agent environment (for example, Claude Code, Cursor or another coding agent). Skill names and install commands differ by agent and can change. Do not invent a package name or install command. Prefer official, maintained skills/docs from the relevant vendor. If no reliable skill exists, use the official documentation and record that no skill was installed.

Recommended skill topics:
- Next.js App Router / React Server Components
- TypeScript
- Tailwind CSS and shadcn/ui
- Clerk authentication
- Neon PostgreSQL and Drizzle ORM
- PostGIS / spatial SQL
- Google Maps JavaScript, Places and Routes APIs
- TanStack Query polling, cache invalidation and stale-data handling
- Trigger.dev tasks and schedules
- Nodemailer and SMTP provider configuration
- Razorpay checkout and webhook verification
- Playwright / Vitest testing
- Vercel deployment and environment variables

## 0. Shared conventions

### Environment files
Maintain:
- `.env.example` — variable names and safe placeholders.
- `.env.local` — local secrets, ignored by Git.
- Vercel environment settings — deployment secrets.

Never put actual keys in source, docs, screenshots, logs or commits.

### Suggested environment-variable inventory

Required for the relevant phases; add only when the integration is introduced.

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_AFTER_SIGN_IN_URL=/
CLERK_AFTER_SIGN_UP_URL=/

# Neon
DATABASE_URL=

# One Google Maps key only; browser-restricted by HTTP referrer + API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Trigger.dev
TRIGGER_SECRET_KEY=
TRIGGER_PROJECT_REF=

# SMTP (Nodemailer)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=

# Razorpay - only if payment demo is implemented
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

```

Notes:
- `DATABASE_URL` must be the Neon connection string. Use the pooled connection string for serverless runtime where appropriate and a direct connection string for migration tooling if the provider recommends it. If using two URLs, name them explicitly, e.g. `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
- Use exactly one Google Maps key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. It is necessarily visible in the browser, so restrict it to the development/production HTTP referrers and only Maps JavaScript API, Places API and Routes API. Keep all Google calls in browser-loaded Maps JavaScript libraries; do not call Google web services from Next.js Route Handlers and do not create a server key.
- No realtime-provider credentials are used. TanStack Query polling and query invalidation provide near-live updates for the MVP.
- Trigger.dev keys, SMTP credentials, Clerk secret, Razorpay secret and webhook secret are server-only. Nodemailer uses the SMTP provider configured through these values; Nodemailer itself does not provide mail delivery.

- Never add keys for integrations not used in the current phase.

### Standard API response convention
Use a consistent JSON shape:
```ts
type ApiSuccess<T> = { data: T; error: null };
type ApiFailure = {
  data: null;
  error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
};
```
Use appropriate HTTP status codes. Do not leak stack traces, provider secrets or internal database errors.

### API conventions
- Validate all request bodies and query parameters with Zod.
- Authenticate with Clerk server-side.
- Authorize by role and resource ownership.
- Use idempotency keys for payment creation, assignment claims and webhook processing where appropriate.
- Paginate list endpoints.
- Use UTC timestamps.
- Return only the data the current role needs.
- Add rate limits to high-risk endpoints.
- Use consistent error codes.
- Document any deviation.

### UI design system checklist
- All colours in `src/app/globals.css` CSS variables.
- Brand palette: warm ivory background, deep forest-green primary, leaf-green secondary, harvest-amber accent, restrained coral for urgent/attention states, and neutral ink/surface tokens.
- Use this same semantic palette across the public landing page, shared components, role dashboards, admin screens, charts and map controls; do not invent per-page palettes.
- Semantic tokens only; no raw palette utility classes or hardcoded colour values.
- shadcn/ui for accessible primitives.
- No `bg-red-100`, `text-blue-600`, `bg-[#...]`, inline hex/rgb/hsl or ad-hoc chart colours.
- Include responsive, loading, empty, error and success states.
- Use synthetic demo labels.
- Never imply food-safety certification.

---

# Phase 0 — Repository foundation and design system

**Status:** ⬜ Not started

## Objective
Create a stable Next.js project foundation, design-token system, environment validation, database connectivity and clean module boundaries before implementing product features.

## Prerequisites
- Node.js version compatible with the selected Next.js release.
- Package manager selected and pinned (npm/pnpm/bun; use one consistently).
- Git repository created.
- Neon project created.
- Clerk application may be created now or in Phase 1.

## Skills/docs to install or read
- Next.js App Router skill/docs.
- TypeScript skill/docs.
- Tailwind CSS skill/docs.
- shadcn/ui skill/docs.
- Neon and Drizzle ORM docs/skill.
- Zod docs.
If a skill is unavailable, use the official docs.

## Environment variables
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- Optional `DATABASE_URL_UNPOOLED` if migrations need a direct connection.

## Build slices
### 0.1 Project bootstrap
- Create Next.js App Router application with TypeScript and strict mode.
- Add Tailwind CSS and shadcn/ui.
- Establish import aliases.
- Add lint, formatting and typecheck scripts.
- Pin runtime/package manager versions in project metadata where appropriate.
- Create a minimal root layout and route.

### 0.2 Design system
- Create `src/app/globals.css`.
- Use this initial light-theme palette as the source of truth (HSL channel values, not component-level literals):

```css
:root {
  --background: 45 33% 97%;
  --foreground: 152 24% 17%;
  --card: 0 0% 100%;
  --card-foreground: 152 24% 17%;
  --popover: 0 0% 100%;
  --popover-foreground: 152 24% 17%;
  --primary: 153 60% 27%;
  --primary-foreground: 0 0% 100%;
  --secondary: 94 35% 83%;
  --secondary-foreground: 151 31% 20%;
  --muted: 45 22% 92%;
  --muted-foreground: 150 10% 40%;
  --accent: 41 88% 62%;
  --accent-foreground: 152 24% 17%;
  --destructive: 8 67% 54%;
  --border: 42 18% 86%;
  --input: 42 18% 86%;
  --ring: 153 60% 27%;
  --success: 145 46% 39%;
  --warning: 39 90% 52%;
  --info: 205 68% 48%;
  --status-available: 145 46% 39%;
  --status-on-delivery: 205 68% 48%;
  --status-unavailable: 150 8% 56%;
  --status-awaiting-pickup: 39 90% 52%;
  --chart-1: 153 60% 27%;
  --chart-2: 94 35% 55%;
  --chart-3: 41 88% 62%;
  --chart-4: 205 68% 48%;
  --chart-5: 8 67% 54%;
  --radius: 0.75rem;
}
```

- Map each semantic token into the installed Tailwind/shadcn convention (for example `hsl(var(--primary))`). Components must consume `bg-primary`, `text-foreground`, `border-border`, etc.; never copy these HSL values into components.
- Define semantic CSS variables for light theme: background, foreground, card, popover, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, border, input, ring, success, warning, info and chart series.
- Establish the shared brand palette: warm ivory canvas; deep forest-green primary; leaf-green secondary; harvest-amber accent; restrained coral for urgent states; and neutral ink, muted and surface tokens. Define the actual HSL values once in `globals.css`, then map them into Tailwind/shadcn semantic variables.
- Add semantic status tokens for available, on-delivery, unavailable and awaiting-pickup; always pair status colour with text/icon.
- Map semantic variables into Tailwind/shadcn theme conventions.
- Add typography, radius, spacing, shadows, container widths and focus styles.
- Create reusable landing-page primitives (public navbar, hero layout, section heading, impact metric, role card, CTA band and footer) without embedding business logic.
- Create reusable application shell, button variants, status badge, page header, empty state and loading skeleton.
- Ensure no raw palette classes or component-level colour literals.

### 0.3 Architecture scaffold
- Create `src/features`, `src/server/services`, `src/server/repositories`, `src/server/policies`, `src/lib`, `src/db/schema`, `src/db/migrations`. In `src/lib`, use `query/` for TanStack Query setup; do not scaffold a realtime/Ably client.
- Add environment validation module. Fail fast with clear variable names when a required variable is absent.
- Add database client and Drizzle config.
- Add health endpoint that reports app readiness without exposing secrets.

### 0.4 Neon connection
- Create a minimal schema/migration only if needed for connection verification.
- Verify local connection.
- Confirm migration command works.

## Suggested API
- `GET /api/health` — app/database readiness. Do not expose connection details.

## Acceptance criteria
- [ ] App starts locally.
- [ ] Lint and typecheck pass.
- [ ] `globals.css` owns all colour tokens and the brand palette is documented.
- [ ] Shared semantic token mapping works in shadcn/ui and Tailwind.
- [ ] No raw colour palette classes in initial components.
- [ ] Neon connection succeeds.
- [ ] Drizzle migration workflow succeeds.
- [ ] `.env.example` exists with placeholders only.
- [ ] `AGENTS.md`, `scope.md`, `addons.md` remain current.

## Tests
- Environment validation tests.
- Health route test.
- Database connection smoke test.
- Design token / lint review.

## Completion handoff
Update `scope.md` Phase 0 to complete and root `memory.md` with scaffold, scripts, DB setup, variables, tests and Phase 1 as next.

---

# Phase 1 — Authentication, onboarding and role dashboards

**Status:** ⬜ Not started

## Objective
Allow donors, receivers and volunteers to register, complete role-specific onboarding and access only their own dashboard. Add an admin role for internal demo operations.

## Prerequisites
- Phase 0 complete.
- Clerk application created.
- Neon/Drizzle connection working.

## Skills/docs to install or read
- Clerk Next.js App Router skill/docs.
- Next.js authentication and middleware/proxy guidance.
- Drizzle schema/migration docs.
- Zod + React Hook Form docs.
- shadcn/ui forms, dialogs, tabs and navigation docs.

## Environment variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_SIGN_IN_URL`
- `CLERK_SIGN_UP_URL`
- `CLERK_AFTER_SIGN_IN_URL`
- `CLERK_AFTER_SIGN_UP_URL`
- `DATABASE_URL`

## Data model
- `users`: Clerk user ID, email, display name, role, account status, created/updated timestamps.
- `organisations`: legal/display name, type, verification status, contact metadata.
- `donor_profiles`: organisation relation and operational profile.
- `receiver_profiles`: organisation relation, capacity, food preferences, radius, operating hours.
- `volunteer_profiles`: user relation, availability, preferred radius, demo coordinates, reliability counters.
- `admin_roles` or trusted server-side admin allowlist. Do not let users self-assign admin.

Use unique constraints on Clerk IDs and organisation membership. Decide whether one user can hold multiple roles; MVP recommendation is one active role per account, with future role switching only if explicitly supported.

## Public landing page — required implementation slice

Build the public marketing experience in this phase; do not leave it as a placeholder or treat it as a future polish task. The landing page is the first product surface and must use the same tokens created in Phase 0.

### Page structure and content
- **Landing / Hero:** Use the product promise, “Rescue the surplus. Connect the willing. Deliver before it expires.” Explain in one clear sentence that the platform connects food donors, NGOs/community kitchens and rescue volunteers to move surplus food before its pickup deadline. Include primary “Get started” and secondary “Explore how it works” actions.
- **Discover:** Explain how users discover nearby surplus listings and suitable rescue opportunities. Show a visual preview of food cards/map markers using clearly labelled synthetic demo data; do not expose real addresses.
- **About:** Explain the problem, the three-sided rescue workflow and the roles of donors, receivers and volunteers. Keep the message human and impact-focused rather than presenting a generic SaaS feature grid.
- **Impact:** Show the impact metrics the platform will measure (meals rescued, food weight diverted and completed deliveries). Any pre-launch/sample figures must be visibly labelled as illustrative/demo values; do not fabricate live impact.
- **Footer / CTA:** Repeat the core call to action and provide concise navigation to Discover, About and Impact.

### Visual and interaction requirements
- Use a clean, modern, trustworthy sustainability identity: warm ivory page canvas, deep forest-green primary actions, leaf-green supporting accents, restrained harvest-amber highlights and neutral ink/surface colours.
- Use generous whitespace, clear typography hierarchy, strong readable hero copy, rounded but restrained surfaces, subtle borders/shadows and purposeful motion only where it improves comprehension.
- Navbar includes brand mark/name, Discover, About, Impact, Sign in and a prominent Get started action. Keep it responsive with an accessible mobile navigation.
- Make the hero visually communicate the complete rescue journey (surplus food → receiver → volunteer → delivery) using composed UI/illustration/cards, not an unrelated stock-photo collage.
- Use consistent CTA variants and shared shadcn/ui primitives. All colours must come from semantic CSS variables; no inline hex values or raw Tailwind palette classes.
- Landing-page links must work. “Get started” and “Sign in” connect to Clerk sign-up/sign-in routes. “Discover” may show a public, privacy-safe preview; requesting or claiming food requires authentication.
- Respect reduced-motion preferences, keyboard navigation, focus visibility, contrast and mobile layouts.

### Acceptance criteria
- [ ] Landing, Discover, About and Impact sections are implemented and linked from the navbar.
- [ ] Hero communicates the problem, solution and three user roles without requiring a scroll.
- [ ] Primary and secondary CTAs navigate to real application routes.
- [ ] Landing page uses the exact Phase 0 semantic tokens and shared component variants.
- [ ] Responsive mobile/tablet/desktop layouts and accessible navigation pass review.
- [ ] Synthetic metrics and locations are clearly labelled; no real personal data is shown.

## User flows
### Shared
- Landing page → sign up/sign in → role selection → role onboarding → dashboard.
- If profile onboarding is incomplete, redirect to onboarding.
- If account is pending verification, show a pending state and restrict sensitive actions.
- If suspended, block protected actions and show support guidance.

### Donor onboarding
- Organisation name and type.
- Contact name/email (minimum necessary).
- Synthetic/demo location or location chosen from a safe demo dataset.
- Operating hours and pickup notes.
- Verification state: `PENDING`, `VERIFIED`, `REJECTED`.

### Receiver onboarding
- Organisation name/type.
- Capacity in meal portions.
- Food categories/dietary requirements.
- Preferred service radius and operating hours.
- Verification state.

### Volunteer onboarding
- Display name or anonymised demo alias.
- Preferred rescue radius.
- Availability preference.
- Demo location/coordinates.
- Transport mode (walk/bicycle/two-wheeler/car, if needed).
- Consent for location use and visibility rules.
- Never expose phone/email on the public map.

## API routes
- `POST /api/onboarding/role`
- `GET /api/me`
- `PATCH /api/profile`
- `POST /api/organisations`
- `PATCH /api/organisations/:id`
- `POST /api/volunteers/profile`
- `PATCH /api/volunteers/availability`
- `GET /api/dashboard/summary` (role-filtered)
All routes require server-side Clerk identity checks. Validate role transitions and ownership.

## UI slices
- Public landing and role selection.
- Sign-in/sign-up pages.
- Role-specific onboarding forms.
- Donor dashboard shell.
- Receiver dashboard shell.
- Volunteer dashboard shell.
- Admin dashboard shell (admin access only).
- Profile completion/pending verification states.

## Acceptance criteria
- [ ] All three user roles can register/sign in.
- [ ] Role selection persists in Neon.
- [ ] Each role lands on the correct dashboard.
- [ ] A donor cannot access receiver/volunteer private data.
- [ ] Users cannot set themselves as admin.
- [ ] Onboarding can be resumed.
- [ ] Forms are Zod validated and accessible.
- [ ] Synthetic demo profile data is clearly marked.

## Tests
- Role assignment and onboarding tests.
- Protected-route tests for all roles.
- Ownership and privilege-escalation tests.
- Form validation tests.
- E2E sign-up/onboarding/dashboard path.

## Completion handoff
Update progress and `memory.md`; next is Phase 2.

---

# Phase 2 — Donor listings and receiver needs

**Status:** ⬜ Not started

## Objective
Build the primary food listing workflow and receiver capacity/preferences. The donor flow must take under one minute.

## Prerequisites
- Phase 1 complete.
- Donor and receiver profiles available.

## Skills/docs to install or read
- Drizzle schema and transaction docs.
- Zod and React Hook Form docs.
- shadcn/ui form, select, date/time, dialog and toast docs.
- Next.js Route Handler docs.
- Optional file upload provider docs only if photos are included; do not add upload infrastructure unless required.

## Environment variables
- `DATABASE_URL`
- Clerk variables from Phase 1.
- Optional image storage variables only if a food-photo feature is approved. MVP may omit images.

## Data model
`food_listings`:
- `id`, `donor_organisation_id`, `created_by_user_id`
- `title`, `food_category`, `diet_type`
- `quantity_portions`, optional `weight_kg`
- `prepared_at`, `pickup_by`
- `storage_instructions`, `allergen_info`, `handling_notes`
- `location` coordinates or PostGIS geography
- `status`, `created_at`, `updated_at`

`food_requests`:
- `id`, `receiver_organisation_id`, `requested_portions`
- `food_preferences`, `dietary_constraints`
- `needed_by`, `preferred_radius`, `status`

Keep quantity units explicit. Do not assume all portions weigh the same. If using a weight estimate, store the conversion assumption and label it.

## Donor listing flow
1. Select food category/title.
2. Enter portions/quantity.
3. Enter preparation time and pickup-by deadline.
4. Enter storage conditions and allergens.
5. Select safe demo pickup location.
6. Preview and publish.
Aim for a single-page quick form with sensible defaults and optional details separated without hiding required safety fields.

## Receiver needs flow
- Set current capacity.
- Set accepted food types and dietary constraints.
- Set required quantity and needed-by time.
- Discover food listings.
- Request or reserve quantity.
- Prevent requests exceeding receiver capacity or listing availability.

## API routes
- `POST /api/listings`
- `GET /api/listings`
- `GET /api/listings/:id`
- `PATCH /api/listings/:id`
- `POST /api/listings/:id/cancel`
- `POST /api/food-requests`
- `GET /api/food-requests`
- `PATCH /api/food-requests/:id`
- `POST /api/listings/:id/requests` (receiver request/reservation intent)

Use role and ownership policies. Only verified/approved donors may publish if verification is enabled. The admin may seed approved demo organisations.

## Validation and business rules
- Quantity must be positive and within configured limits.
- `pickup_by` must be in the future at creation.
- Prepared time cannot be implausibly after pickup deadline.
- Required storage/handling and allergen fields must be present; allow explicit “unknown/not provided” where appropriate, never silently imply allergen-free.
- Expired listings cannot be requested.
- Receiver capacity must be checked at reservation.
- Donor cannot edit critical fields after a listing has active assignments without a controlled cancellation/reassignment flow.
- Use transactions for reservation and quantity updates.

## UI
- Donor quick-post flow.
- Listing management table/cards.
- Listing detail with safety metadata and deadline.
- Receiver discover page with filters.
- Receiver request/confirmation flow.
- Clear expired/available/reserved states.

## Acceptance criteria
- [ ] Donor can publish a valid listing in under 60 seconds in usability test.
- [ ] Food metadata is visible to receivers and volunteers as appropriate.
- [ ] Receiver can set needs/capacity.
- [ ] Expired listings cannot be reserved.
- [ ] Quantity cannot be over-allocated.
- [ ] Listing ownership is enforced.
- [ ] No food-safety certification claim appears.

## Tests
- Listing schema validation.
- Time-window edge cases.
- Quantity/capacity transaction tests.
- Role/ownership tests.
- Donor flow E2E test and timed usability check.

## Completion handoff
Update `memory.md`; next is Phase 3.

---

# Phase 3 — Location model, maps and route calculations

**Status:** ⬜ Not started

## Objective
Show anonymised donor, receiver and volunteer markers on a map; shortlist nearby candidates and calculate useful route distance/ETA.

## Prerequisites
- Phase 2 complete.
- Google Cloud project and billing configured.
- Synthetic demo coordinates prepared.

## Skills/docs to install or read
- Google Maps JavaScript API docs/skill.
- Google Places API docs/skill if autocomplete is used.
- Google Routes API docs/skill.
- Neon/PostGIS spatial query docs/skill.
- Next.js client-component and dynamic import docs.
- Google Maps key restriction and billing documentation.

## Google Cloud setup
Enable only the APIs used:
- Maps JavaScript API.
- Places API (New) if autocomplete is required.
- Routes API.
- Geocoding API only if address-to-coordinate conversion is actually needed.

Set billing budgets/alerts and API quotas. Use exactly one key named `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Restrict it by HTTP referrer to approved local/deployed domains and by API to Maps JavaScript API, Places API and Routes API. Keep Google Maps calls in browser-loaded Maps JavaScript libraries; do not make server-side Google web-service calls. Do not create `GOOGLE_MAPS_SERVER_API_KEY`.

## Environment variables
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (the only Google Maps key)
- `DATABASE_URL`

## Location data model
- Store latitude/longitude and, where available, a PostGIS geography point.
- Store a location visibility classification and consent/source.
- Store only approximate or synthetic public map positions.
- Do not store/share exact volunteer location history unless explicitly required and consented to.
- For demo, seed synthetic coordinates and anonymised labels.

## Map features
- Donor markers for active listings.
- Receiver markers for eligible organisations.
- Volunteer markers:
  - Green: available.
  - Blue: on an active delivery.
  - Grey: unavailable.
  - Orange: assignment reserved/awaiting pickup.
- Marker popup: anonymised name/ID, role, availability, approximate distance, completed deliveries/reliability where appropriate.
- Map legend, filters and list alternative.
- Do not show private contact details or exact personal home addresses.

## Candidate selection and routes
1. Use PostGIS radius query to shortlist nearby receivers and volunteers.
2. Apply eligibility constraints in the matching service.
3. Use the browser Routes library from the Google Maps JavaScript API for actual route distance/ETA on a small visible/selected shortlist.
4. Use server-side straight-line distance for deterministic initial matching; do not trust client-submitted route metrics for authorization or eligibility decisions.
5. Cache route results in client query cache for a short, appropriate interval; invalidate when locations/deadlines change.
6. Do not calculate routes for every marker on every render and do not use the deprecated Distance Matrix API for a new build.

## API routes
- `GET /api/map/markers?bounds=...&roles=...`
- `GET /api/locations/nearby?lat=...&lng=...&radiusKm=...`
- `PATCH /api/volunteers/location` (only if location sharing is enabled; coarse/demo location preferred)

Do not accept arbitrary unbounded candidate arrays from the browser. Enforce radius, count and rate limits.

## Acceptance criteria
- [ ] Map renders with synthetic demo data.
- [ ] Markers use role/status semantics and legend.
- [ ] Map has an accessible list alternative.
- [ ] Candidate shortlist uses spatial filtering or documented fallback.
- [ ] Browser Routes library returns route distance/ETA for shortlisted locations.
- [ ] Only one Google key exists in the environment inventory and it is referrer/API restricted.
- [ ] Public demo does not expose real addresses or personal details.

## Tests
- Spatial radius query tests.
- Marker filtering tests.
- Route response validation and provider-error tests.
- Map loading/error state tests.
- API key restriction review.

## Completion handoff
Update `memory.md`; next is Phase 4.

---

# Phase 4 — Matching engine, assignment and rescue order lifecycle

**Status:** ⬜ Not started

## Objective
Create the core deterministic matching service and a reliable assignment workflow that prevents duplicate claims and records every status transition.

## Prerequisites
- Phase 3 complete or route service can be stubbed behind a tested interface.
- Listings, receiver needs and volunteer profiles exist.

## Skills/docs to install or read
- Drizzle transaction and SQL locking docs.
- PostgreSQL concurrency/transaction docs.
- PostGIS docs.
- Google Routes API docs.
- Zod docs.
- Vitest/Jest testing docs.

## Matching pipeline
### Hard eligibility filters
- Listing is active and not expired.
- Receiver is eligible and has remaining capacity.
- Food type/dietary constraints are compatible.
- Receiver can receive the required quantity.
- Volunteer is available and within preferred rescue radius (unless a configured override is explicitly allowed).
- Volunteer has no conflicting active assignment.
- Estimated pickup and delivery can complete before deadline.
- Listing/quantity is not already fully allocated.

### Ranking
Initial configurable score:
`0.35 × distanceSuitability + 0.25 × urgencySuitability + 0.20 × reliability + 0.20 × receiverNeedSuitability`

Normalise each dimension to 0–100. Document formula and weights in code/config. Rescue Credits may act only as a small tie-breaker after hard eligibility and core score. Do not allow credits to override time, safety metadata, capacity or need.

### Assignment flow
1. Listing published.
2. Find eligible receivers and volunteers.
3. Compute shortlist and score.
4. Notify candidates.
5. Receiver requests/accepts allocation.
6. Volunteer accepts delivery assignment.
7. Atomically reserve listing quantity and assignment.
8. Record status event and publish event.
9. Allow controlled decline/cancel/reassignment.
10. Complete pickup and delivery with proof/OTP.

Decide and document whether MVP supports partial quantity allocation. Recommended MVP: one receiver/order per listing to reduce concurrency complexity; keep schema extensible.

## Data model
- `rescue_orders`: listing, receiver, volunteer, allocated quantity, status, deadline and timestamps.
- `delivery_events`: order ID, event, actor, timestamp, notes/proof.
- Add idempotency/claim fields as needed.
- Add database constraints/indexes for active listing/assignment integrity.

## API routes
- `POST /api/matching/listings/:listingId/run`
- `GET /api/matching/listings/:listingId/results`
- `POST /api/rescue-orders`
- `GET /api/rescue-orders`
- `GET /api/rescue-orders/:id`
- `POST /api/rescue-orders/:id/accept`
- `POST /api/rescue-orders/:id/decline`
- `POST /api/rescue-orders/:id/cancel`
- `POST /api/rescue-orders/:id/transition`

Use server-side role and ownership checks. Prefer explicit transition endpoints or a typed transition service rather than arbitrary status PATCH.

## Concurrency and consistency
- Use a database transaction and conditional update/row lock when claiming.
- A second simultaneous claim must fail cleanly with conflict response.
- Persist status transition in Neon, then rely on affected clients to refetch through TanStack Query polling or mutation invalidation.
- Use idempotency keys or unique event constraints to avoid duplicate delivery/credit records.
- Keep a full audit trail.
- Never trust client-supplied match scores or route distance.

## Acceptance criteria
- [ ] Eligible candidates are filtered and ranked.
- [ ] Match result includes explainable reasons (e.g. route ETA, quantity fit, deadline fit).
- [ ] Concurrent claim attempts cannot both succeed.
- [ ] Every transition is authorised and audited.
- [ ] Decline/cancel/reassignment works according to documented rules.
- [ ] Expired listings cannot be assigned.
- [ ] The complete order state is visible to relevant dashboards.

## Tests
- Matching unit tests for each score dimension.
- Hard-filter tests.
- Deadline edge cases.
- Simultaneous claim integration test.
- Invalid state transition tests.
- Duplicate request/idempotency tests.
- Role/ownership tests.

## Completion handoff
Update `memory.md`; next is Phase 5.

---

# Phase 5 — Volunteer availability polling and delivery verification

**Status:** ⬜ Not started

## Objective
Keep volunteer availability, rescue opportunities and order status fresh without a realtime provider, and implement reliable pickup/delivery confirmation.

## Prerequisites
- Phase 4 assignment lifecycle exists.
- Synthetic map data available.

## Skills/docs to install or read
- TanStack Query query keys, polling/refetch, invalidation and stale-time docs.
- Next.js Route Handler docs.
- Clerk server auth docs.
- QR/OTP security guidance if using OTP.
- React state and effect cleanup docs.

## Environment variables
- Clerk variables
- `DATABASE_URL`

## Polling and refresh behaviour
- Use TanStack Query for server state.
- Poll active volunteer availability, active assignments and relevant map markers every 10–15 seconds while the corresponding screen is visible.
- Pause or reduce polling when the tab is hidden; resume/refetch when it becomes visible.
- Invalidate relevant query keys immediately after a successful mutation (availability toggle, assignment accept/decline, pickup confirmation, delivery confirmation).
- Show last-updated time and a visible stale/offline state when requests fail; never silently present stale availability as current.
- Use server pagination, bounds and role/ownership filters. Do not fetch all users or all locations to refresh a map.
- Neon remains authoritative. Polling is a near-live MVP strategy, not guaranteed instantaneous push delivery. Do not add Ably, Socket.IO or WebSockets.

## Availability behaviour
- Available → green marker plus “Available” label.
- On delivery → blue marker plus “On delivery” label.
- Unavailable → grey marker plus “Unavailable” label.
- Reserved/awaiting pickup → orange marker plus matching label.
- Toggle availability in dashboard.
- Enforce no conflicting assignments server-side.
- Keep location sharing consent explicit; public/demo maps use synthetic/coarse positions only.

## OTP verification
- Generate a cryptographically secure, short-lived, one-time code or token.
- Store only a hash of the OTP.
- Bind OTP to order + action (pickup or delivery).
- Enforce expiry, attempt limits and rate limits.
- Mark token consumed atomically.
- Do not use predictable codes in production. For demo, seeded OTPs may be displayed in a clearly labelled demo mode.
- Record actor and timestamp for verification.

## API routes
- `PATCH /api/volunteers/availability`
- `POST /api/rescue-orders/:id/pickup/verify`
- `POST /api/rescue-orders/:id/delivery/verify`
- `GET /api/rescue-orders/:id`

## Acceptance criteria
- [ ] Availability changes persist in Neon.
- [ ] Active screens poll at the configured interval and stop/reduce polling when hidden.
- [ ] Mutations invalidate/refetch affected query keys immediately.
- [ ] Last-updated and stale/offline states are visible.
- [ ] Role and ownership checks protect every polling endpoint.
- [ ] Pickup OTP is order-bound, expires and cannot be reused.
- [ ] Delivery OTP is order-bound, expires and cannot be reused.
- [ ] Order status and map refresh after successful verification.

## Tests
- Polling interval/visibility behaviour tests.
- Query invalidation tests after mutations.
- Availability state tests.
- OTP expiry/replay/attempt-limit tests.
- Role/ownership tests for polling endpoints.
- End-to-end volunteer delivery test.

## Completion handoff
Update `memory.md`; next is Phase 6.

---

# Phase 6 — Background jobs, expiry and notifications

**Status:** ⬜ Not started

## Objective
Automate listing expiry, reminders and notifications so food is not left unclaimed or displayed after its deadline.

## Prerequisites
- Phase 2 listing model complete.
- Phase 4 order lifecycle available.
- Trigger.dev account created and SMTP credentials from a delivery provider configured.

## Skills/docs to install or read
- Trigger.dev current SDK/tasks/schedules docs or skill.
- Nodemailer SMTP transport and the selected SMTP provider documentation.
- Webhook/signature and idempotency docs.
- Next.js server-only module guidance.

## Environment variables
- `TRIGGER_SECRET_KEY`
- `TRIGGER_PROJECT_REF`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `DATABASE_URL`
- Clerk server variables if job actions require identity context (use trusted system context for scheduled tasks).

## Trigger.dev jobs
- `expire-food-listing`: run at/after `pickup_by`; only expire if still available/unreserved.
- `remind-volunteer`: remind accepted volunteer before pickup deadline.
- `notify-donor-status`: send listing claimed/collected/delivered updates.
- `notify-receiver-match`: alert receiver to eligible listing.
- `notify-unclaimed-listing`: notify admin/eligible parties if urgent food remains unclaimed.
- Optional daily digest for donor impact.

All jobs must be idempotent and re-check database state before mutating. Do not rely solely on a scheduled task payload; fetch current record.

## Notification channels
- In-app notifications stored in Neon.
- Email through Nodemailer using the configured SMTP provider.
- In-app notifications are persisted in Neon and surfaced through TanStack Query polling/refetch.
Avoid building SMS/WhatsApp unless time and approved provider setup justify it.

## API routes
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- Trigger.dev task endpoints are managed by its SDK; do not create insecure public task triggers.

## Acceptance criteria
- [ ] Listing expires when deadline passes if not rescued.
- [ ] Reserved/active listings are not incorrectly expired.
- [ ] Reminders send once or are safely idempotent.
- [ ] Email templates show relevant food deadline and status.
- [ ] Notification preferences and failures are handled.
- [ ] Job failures are observable and retry-safe.

## Tests
- Expiry before/at/after deadline.
- Duplicate job invocation.
- SMTP/Nodemailer failure and retry behaviour.
- Notification recipient authorisation.
- Scheduled task integration test.

## Completion handoff
Update `memory.md`; next is Phase 7.

---

# Phase 7 — Impact, Rescue Credits, admin and business model

**Status:** ⬜ Not started

## Objective
Make impact measurable and explainable, recognise volunteer contribution, provide platform operations and demonstrate a plausible revenue model.

## Prerequisites
- Completed rescue order lifecycle.
- Delivery confirmation events.
- Synthetic completed-order seed data.

## Skills/docs to install or read
- Drizzle aggregation/query docs.
- Recharts or chosen chart library docs (if charts are needed).
- Razorpay current checkout and webhook docs/skill if payment demo is implemented.
- Clerk organisation/role authorization docs.
- Financial ledger and webhook idempotency guidance.

## Environment variables
- `DATABASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- Clerk variables
- Optional SMTP variables from Phase 6 if transactional payment emails are implemented.

## Impact metrics
- Total delivered meal portions.
- Total verified delivered weight, where available.
- Estimated food waste avoided only when weight is measured or a documented conversion assumption exists.
- Estimated emissions avoided only if a credible documented factor is selected. Otherwise omit.
- Active donors, receivers and volunteers.
- Rescue completion rate and average time to pickup.
- Unclaimed/expired food count.

Only delivered and verified quantities count as rescued. Show posted, claimed, collected and delivered separately. Display calculation method, unit, data source, assumption and version. Clearly label estimates.

## Rescue Credits
- Successful verified delivery: configurable base points.
- On-time completion: optional bonus.
- Urgent rescue acceptance: optional bonus.
- Repeated reliable completion: progressive recognition.
- Cancellation/no-show penalties must be carefully bounded and appealable.
- Credits are not cash and are not a substitute for compensation.
- Use an immutable ledger: record point deltas and reasons; do not only overwrite a balance.
- Use idempotency so duplicate delivery events do not award points twice.

## Admin dashboard
- Review donor/receiver organisation verification.
- Review volunteer profiles.
- Inspect active listings and orders.
- Monitor expired/unclaimed listings.
- Resolve reports/disputes.
- Inspect payment and sponsor ledgers.
- Review impact and operational metrics.
- Manage synthetic demo data.
Admin operations must be audited.

## Business model demo
- Basic community donation remains free.
- Donor subscription tiers for advanced analytics and recurring listing management.
- CSR sponsorships fund rescue campaigns.
- Sponsor/donor logistics budgets fund volunteer delivery compensation.
- Receiver participation remains free.
- Volunteer registration remains free.
- Avoid tax/legal benefit promises.
- Proposed pilot prices are illustrative and must be labelled as such.

## Payment demo
For hackathon, Razorpay test mode or a clearly labelled simulated ledger is sufficient.
- Create payment order server-side.
- Verify signature server-side.
- Process webhooks idempotently.
- Store provider reference and status.
- Never trust client success callback alone.
- Do not make actual volunteer payouts unless a compliant payout product/account is configured and tested.

## Suggested API routes
- `GET /api/impact/summary`
- `GET /api/impact/history`
- `GET /api/volunteers/credits`
- `GET /api/volunteers/earnings`
- `GET /api/admin/overview`
- `GET /api/admin/listings`
- `PATCH /api/admin/organisations/:id/verification`
- `POST /api/payments/checkout`
- `POST /api/webhooks/razorpay`

## Acceptance criteria
- [ ] Impact dashboard uses delivered records only.
- [ ] Formulas and assumptions are visible.
- [ ] Credits are ledger-based and idempotent.
- [ ] Admin routes enforce admin role.
- [ ] Payment webhook signature is verified.
- [ ] Payment records distinguish test/simulated from real.
- [ ] Revenue model is understandable to a judge.
- [ ] Receivers and volunteers are not charged participation fees.

## Tests
- Impact aggregation and formula tests.
- Duplicate credit award tests.
- Admin authorization tests.
- Razorpay signature and webhook replay tests.
- Payment failure/refund state tests if implemented.

## Completion handoff
Update `memory.md`; next is Phase 8.

---

# Phase 8 — QA, accessibility, security, demo and deployment

**Status:** ⬜ Not started

## Objective
Deliver a reliable, polished, judge-ready application using synthetic data and a complete end-to-end rescue demonstration.

## Prerequisites
- Phases 0–7 complete or any omissions explicitly documented.
- Vercel project created.
- Production-like environment variables configured.
- Synthetic seed dataset and demo accounts prepared.

## Skills/docs to install or read
- Playwright E2E testing skill/docs.
- Vitest/Jest and Testing Library docs.
- Next.js deployment docs.
- Vercel environment/deployment docs.
- Clerk production deployment docs.
- Neon production connection/migration docs.
- Google Maps API security/billing docs.
- OWASP web application security guidance.
- Accessibility/WCAG and keyboard testing guidance.

## Environment variables
All required production values from prior phases, configured in Vercel:
- App URL.
- Clerk publishable/secret keys.
- Neon database URL.
- One restricted Google Maps browser key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).
- Trigger.dev keys/project reference.
- SMTP host, port, username, password, secure flag and sender address for Nodemailer.
- Razorpay test keys/webhook secret if payment demo enabled.
- Optional monitoring DSN.

## QA checklist
### Functional
- [ ] Donor → listing → receiver → volunteer → pickup → delivery → impact works.
- [ ] All role dashboards show correct data.
- [ ] Listing deadline and expiry work.
- [ ] Concurrent claims are safe.
- [ ] OTP cannot be replayed.
- [ ] Credits cannot be duplicated.
- [ ] Payment test flow/webhook works or is clearly marked simulated.

### Security/privacy
- [ ] Server-side role/ownership checks.
- [ ] No secrets in client bundle or Git.
- [ ] Google keys restricted.
- [ ] Webhook signatures verified.
- [ ] Rate limits on sensitive endpoints.
- [ ] No real personal details or addresses in demo.
- [ ] No precise public volunteer tracking.
- [ ] No unsafe food-safety claims.

### UI/accessibility
- [ ] Responsive on mobile/tablet/desktop.
- [ ] Keyboard navigation and visible focus.
- [ ] Form labels and validation messages.
- [ ] Status communicated by text/icon, not colour alone.
- [ ] Loading, empty, error and success states.
- [ ] Map list alternative and legend.
- [ ] All colours sourced from `globals.css`.
- [ ] No raw palette classes or inline colour literals.

### Deployment
- [ ] Database migrations applied to deployment DB.
- [ ] Environment variables configured by environment.
- [ ] Clerk allowed origins/URLs updated.
- [ ] Google Maps referrers updated.
- [ ] Trigger.dev deployment and schedules configured.
- [ ] SMTP sender/domain verified with the configured provider if sending email.
- [ ] Razorpay webhook points to deployed endpoint if used.
- [ ] Health check passes.
- [ ] Seed demo data is safe and reproducible.

## Judge demo script
1. Sign in as a restaurant donor.
2. Post 100 synthetic meal portions with pickup deadline and handling/allergen details.
3. Show matching results and nearby receiver/volunteer map.
4. Sign in as an NGO receiver and request/confirm the food.
5. Sign in as a volunteer, switch to available and accept assignment.
6. Show map and order status updating live.
7. Verify pickup OTP.
8. Verify delivery OTP.
9. Show donor/receiver/volunteer dashboards updated.
10. Show impact dashboard and assumptions.
11. Show sponsor-funded delivery compensation and the business model.
12. Show admin overview.

Do not stage false real-world outcomes. Clearly label seeded demo records and simulated payment events.

## Final acceptance criteria
- [ ] Complete end-to-end demo works on deployed URL.
- [ ] Critical tests pass.
- [ ] Lint/typecheck pass.
- [ ] Security and privacy checklist passes.
- [ ] Synthetic data only.
- [ ] No unsupported food-safety/legal/tax claims.
- [ ] `scope.md`, `addons.md` and root `memory.md` are updated.
- [ ] Known limitations are disclosed.

---

## API route index (planned)

| Domain | Method | Route | Purpose |
|---|---|---|---|
| Health | GET | `/api/health` | Readiness |
| Identity | GET | `/api/me` | Current user/profile |
| Onboarding | POST | `/api/onboarding/role` | Select role |
| Profiles | PATCH | `/api/profile` | Update own profile |
| Organisation | POST | `/api/organisations` | Create organisation |
| Listings | POST | `/api/listings` | Publish surplus |
| Listings | GET | `/api/listings` | Discover/list |
| Listings | GET | `/api/listings/:id` | Listing details |
| Listings | PATCH | `/api/listings/:id` | Edit owned listing |
| Requests | POST | `/api/food-requests` | Create receiver need |
| Requests | GET | `/api/food-requests` | List own requests |
| Map | GET | `/api/map/markers` | Map markers |
| Location | GET | `/api/locations/nearby` | Nearby candidates |
| Matching | POST | `/api/matching/listings/:listingId/run` | Run matching |
| Matching | GET | `/api/matching/listings/:listingId/results` | Read ranked results |
| Rescue | POST | `/api/rescue-orders` | Create order |
| Rescue | GET | `/api/rescue-orders` | List permitted orders |
| Rescue | POST | `/api/rescue-orders/:id/accept` | Accept assignment |
| Rescue | POST | `/api/rescue-orders/:id/decline` | Decline assignment |
| Rescue | POST | `/api/rescue-orders/:id/pickup/verify` | Verify pickup |
| Rescue | POST | `/api/rescue-orders/:id/delivery/verify` | Verify delivery |
| Volunteer | PATCH | `/api/volunteers/availability` | Change availability |
| Notifications | GET | `/api/notifications` | List notifications |
| Notifications | PATCH | `/api/notifications/:id/read` | Mark read |
| Impact | GET | `/api/impact/summary` | Aggregate impact |
| Credits | GET | `/api/volunteers/credits` | Credit ledger |
| Admin | GET | `/api/admin/overview` | Admin metrics |
| Payments | POST | `/api/payments/checkout` | Create checkout |
| Webhooks | POST | `/api/webhooks/razorpay` | Verified payment event |

This is a planned contract index. Implement only routes required by the current phase; do not scaffold every endpoint prematurely.

## Final rule

**No phase begins until its complete specification, prerequisites, credentials, skills/docs and acceptance criteria have been reviewed. No phase ends until tests pass, progress is updated, and root `memory.md` records what was built and what comes next.**
