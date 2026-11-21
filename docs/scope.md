# Project Scope — Tripti

> This document defines what we are building, why, the boundaries of the MVP, architecture, milestones and progress tracking. Read [`../AGENTS.md`](../AGENTS.md) first. Detailed implementation specifications and phase prerequisites are in [`addons.md`](addons.md).

## 1. Product overview

**Product name:** Tripti (renamed from the working name "Food Rescue Platform" in 2026; see AGENTS.md §11)  
**Hackathon:** Codebenders ACE Builders Hackathon 2026  
**Problem statement:** Problem Statement 2 — Society and Environment, “Rescue the Surplus”.

### Problem

Restaurants, caterers, wedding venues, hostel messes and canteens discard edible surplus food while nearby NGOs, community kitchens and shelters need food. There is no fast, dependable way to connect the two sides and coordinate collection before the food spoils. Food waste also contributes to greenhouse-gas emissions when disposed of in landfills.

### Solution

A location-aware, three-sided platform connecting:
- **Donors:** publish surplus food, quantity, preparation details and pickup deadline.
- **Receivers:** NGOs, shelters and community kitchens that specify need, capacity and food preferences.
- **Rescue Volunteers:** registered individuals who accept collection/delivery assignments.
- **Admins:** oversee operations, verification, moderation, payment records and impact.

The system finds eligible receivers and volunteers, ranks rescue options using distance, quantity, urgency, receiver need, volunteer availability and reliability, coordinates collection/delivery, and records impact.

### Product positioning

**Rescue the surplus. Connect the willing. Deliver before it expires.**

### Tripti landing-page message (2026)
- **Central idea:** "Good food deserves a better destination."
- **Trust line:** "Less waste. More meals. Stronger communities."
- **Purpose:** a coordinated food-rescue ecosystem, not merely a donation listing site. Donors publish surplus food, receivers discover suitable donations, volunteers handle transport, and verified deliveries feed measurable impact.
- **Target users:** donors (restaurants, caterers, hostels, food businesses), receivers (NGOs, shelters, community kitchens), volunteers.
- **Workflow:** share surplus → find what the community needs → volunteer rescues and delivers → verified delivery → impact.

## 2. Goals and success criteria

### Product goals
1. Make donor listing creation take less than 60 seconds.
2. Match surplus food with suitable receivers and available volunteers.
3. Provide a transparent order lifecycle: posted → claimed → collected → delivered.
4. Provide handling, storage, allergen and time-limit information on every listing.
5. Show meals saved and food waste avoided with visible assumptions.
6. Demonstrate a credible funding model through donor subscriptions and CSR/logistics sponsorship.
7. Make the volunteer network useful through availability, preferred rescue radius, compensation records and non-cash Rescue Credits.

### Hackathon success criteria
- A judge can register/sign in as each of the three roles using demo accounts.
- A donor can create a synthetic food listing in under one minute.
- A receiver can discover and request/reserve a suitable listing.
- A volunteer can toggle availability and accept a rescue.
- The map reflects donor/receiver/volunteer demo locations and relevant status.
- An order can progress through pickup and delivery confirmation.
- Impact metrics update after delivery and show their calculation assumptions.
- The admin can inspect users/listings/orders and see aggregate metrics.
- The demo contains synthetic data only and no real personal addresses.

## 3. Users and responsibilities

| Role | Primary user | Main job | Main dashboard areas |
|---|---|---|---|
| Donor | Restaurant, caterer, hostel mess, canteen, event organiser | Publish surplus and monitor rescue | Overview, Post Surplus, Receivers, Volunteer Map, Active Orders, History, Impact, Billing |
| Receiver | NGO, shelter, community kitchen | Request suitable food and confirm receipt | Overview, Discover Food, Requests, Active Deliveries, History, Impact, Organisation Profile |
| Volunteer | Student, bachelor, working professional, individual | Collect and deliver food | Overview, Availability, Live Map, Available Rescues, Active Delivery, Credits, Earnings, History |
| Admin | Platform operator | Maintain safe, reliable operations | Verification, Users, Listings, Orders, Disputes, Payments, Impact, Settings |

Initial launch focus: one city/neighbourhood and one donor/receiver category. The hackathon demo can use Hyderabad-like synthetic coordinates, but must not publish real addresses or personal details.

## 4. Scope boundaries

### In scope for MVP
- Clerk authentication and role-aware onboarding.
- Donor, receiver and volunteer profiles.
- Admin access for demo operations.
- Donor food listing form with quantity, food category, preparation time, storage, allergens and pickup deadline.
- Receiver capacity/preferences and food discovery/request.
- Volunteer profile, availability, preferred rescue radius and demo location.
- Map visualisation with anonymised markers and clear marker legend.
- PostGIS nearby candidate filtering where available; fallback to bounded coordinate-distance calculations for demo if PostGIS setup is not ready.
- Google Routes distance/ETA for shortlisted candidates.
- Deterministic matching score and eligibility rules.
- Rescue assignment and atomic claim handling.
- Order lifecycle and pickup/delivery OTP confirmation.
- Near-live availability and order updates using TanStack Query polling and mutation-driven query invalidation (no Ably).
- Trigger.dev scheduled expiry/reminders.
- Impact dashboard with explicit formulas and assumptions.
- Basic sponsor/subscription/payment demonstration using Razorpay test mode or labelled simulated payment.
- Responsive role-specific dashboards and admin overview.
- Synthetic seed data and demo accounts.

### Out of scope unless time remains
- Public consumer marketplace for individual meal recipients.
- Real-time public tracking of a volunteer's precise location.
- Food-safety certification, inspection or guarantee.
- Real financial payouts to volunteers in the hackathon MVP.
- Automated tax receipts or legal claims.
- Complex multi-stop route optimisation.
- AI-based food safety decisions or autonomous diagnosis of food quality.
- Multi-city production scaling, microservices and elaborate dispatch optimisation.
- Production-grade KYC, banking verification and regulatory compliance workflows.

## 5. Business model

### Principles
- Receivers/NGOs should receive rescued food without a platform participation fee.
- Volunteers should not pay to register or accept rescue assignments.
- Delivery compensation should be sponsor- or donor-funded, not deducted unexpectedly from volunteer rewards.
- Rescue Credits are non-cash recognition/priority points and must remain distinct from payable compensation.
- Avoid promising tax deductions or legal benefits.

### Revenue streams
1. **Donor subscriptions:** optional paid tools for recurring listings, multi-location management, analytics and donation reports. Basic donation remains free.
2. **CSR sponsorship:** companies fund rescue campaigns, geographic areas or a number of meals rescued and receive transparent impact reports.
3. **Sponsored logistics:** donors or CSR sponsors fund volunteer delivery compensation and operational costs.
4. **Enterprise analytics:** larger food businesses may pay for surplus trends, reporting and multi-location administration.

### Illustrative pilot pricing (validate before real launch)
- Community: free, basic donation.
- Business: ₹499/month, recurring listing and basic analytics.
- Enterprise: ₹1,499/month, multi-location and advanced reporting.
- CSR sponsor: custom campaign budget.

These are hypotheses for the prototype, not validated market prices.

### Example money flow
- Donor or CSR sponsor pays the platform for a subscription, sponsorship or logistics budget.
- Platform allocates an agreed delivery reward to a volunteer after verified completion.
- Platform may retain an explicitly disclosed service/operations fee from the sponsor-funded budget.
- Receiver gets food without paying.
- For hackathon demo, use Razorpay test mode or simulated ledger entries; do not claim real payouts occurred.

## 6. Technical architecture

### Locked stack

| Layer | Technology | Purpose |
|---|---|---|
| Full-stack framework | Next.js App Router | Frontend, server rendering, API Route Handlers |
| Language | TypeScript | Type-safe application |
| UI | React, Tailwind CSS, shadcn/ui | Dashboards and accessible components |
| Design tokens | CSS variables in `app/globals.css` (spec path `src/app/globals.css`; see AGENTS.md §11) | Centralised theme |
| Authentication | Clerk | Sign-in, sign-up, session |
| Database | Neon PostgreSQL | Persistent records |
| Spatial queries | PostGIS where enabled | Nearby candidate filtering |
| ORM | Drizzle ORM | Typed schema, queries and migrations |
| Validation | Zod | API and form validation |
| Forms | React Hook Form | Donor/receiver/volunteer forms |
| Maps | Google Maps JavaScript API | Interactive map and markers |
| Places | Google Places API | Place autocomplete/search |
| Routes | Google Routes API | Route distance and ETA |
| Client data refresh | TanStack Query polling | Near-live availability, listing and order updates |
| Background jobs | Trigger.dev | Expiry, reminders and scheduled tasks |
| Email | Nodemailer + SMTP | Transactional notifications |
| Payments | Razorpay | Test-mode checkout/subscription demo |
| Hosting | Vercel | Deployment |
| Tests | Vitest/Jest, Testing Library, Playwright | Unit, component and E2E tests |

### High-level data flow

```text
Browser / Next.js UI
   ├── Clerk identity
   └── Next.js Route Handlers
          ├── Feature services / policies
          ├── Drizzle repositories ── Neon PostgreSQL (+ PostGIS)
          ├── Google Maps / Places / Routes
          ├── TanStack Query polling + query invalidation
          ├── Trigger.dev tasks
          ├── Nodemailer → configured SMTP provider
          └── Razorpay checkout + verified webhooks
```

### Architecture constraints
- No separate FastAPI/NestJS/Express backend.
- Keep domain logic in `src/server/services` and access rules in `src/server/policies`.
- Use repositories for database access.
- Use transactions for claim/assignment, status transitions, credit awards and payment-ledger writes.
- Neon is the source of truth. TanStack Query polls active views every 10–15 seconds and mutations invalidate affected queries; no Ably dependency.
- PostGIS/Haversine shortlists candidates server-side. The single browser-restricted Google Maps key powers Maps JavaScript, Places and the browser Routes library for a limited shortlist; no server-side Google Maps calls.
- Trigger.dev handles durable scheduled work; do not use in-memory timers.
- No Redis or microservices for the initial build.
- Repository layout (2026): `app/`, `components/` and `public/` sit at the repo root, not under `src/`. Paths written as `src/...` in this document are pending reconciliation; see AGENTS.md §11.

## 7. Main domain entities

| Entity | Important fields / responsibility |
|---|---|
| User | Clerk user ID, email, display name, active role |
| Organisation | Name, type, verification status, contact profile |
| DonorProfile | Organisation ID, pickup location, operating hours |
| ReceiverProfile | Organisation ID, capacity, dietary preferences, service radius |
| VolunteerProfile | User ID, availability, preferred radius, reliability metrics |
| FoodListing | Donor, food type, portions/weight, preparation time, storage, allergens, deadline, coordinates, status |
| FoodRequest | Receiver, requested quantity, dietary needs, preferred time |
| RescueOrder | Listing, receiver, volunteer, assignment state, timestamps |
| DeliveryEvent | Order, event type, actor, timestamp, proof reference |
| RescueCreditLedger | Volunteer, points delta, reason, linked order |
| PaymentLedger | Payer, payee, purpose, amount, status, provider reference |
| ImpactRecord | Completed order, portions, weight, calculation version and assumptions |
| Notification | Recipient, channel, event, delivery state |

Use enums for role and state fields. Store money in integer minor units (paise) with currency code. Store timestamps in UTC and render in the user's locale. Store coordinates as numeric/geography values; never treat an address string as a substitute for spatial data.

## 8. Matching logic

### Eligibility filters (hard constraints)
- Listing is active and not expired.
- Receiver can accept the food category and quantity.
- Receiver capacity is not exceeded.
- Pickup and delivery can reasonably complete before the deadline.
- Volunteer is available, within configured radius and not already assigned beyond capacity.
- Listing is not already claimed by another active rescue order.

### Ranking score (initial configurable weights)
Normalise each dimension to 0–100:

`matchScore = 0.35 × distanceSuitability + 0.25 × urgencySuitability + 0.20 × volunteerReliability + 0.20 × receiverNeedSuitability`

- **Distance suitability:** closer route distance/ETA scores higher.
- **Urgency suitability:** prioritise listings nearing pickup deadline, while still allowing enough time to complete delivery.
- **Volunteer reliability:** derived from verified completed/on-time assignments and cancellations; avoid punitive scores from insufficient history.
- **Receiver need suitability:** fit between quantity, requested food type, dietary requirements and capacity.

Hard constraints must not be overridden by points or credits. Rescue Credits may be a small tie-breaker/priority modifier only after eligibility and base scoring; never allow credits to override deadlines, safety metadata or receiver capacity.

Weights must be configurable and documented, not embedded in UI code.

## 9. Order lifecycle

Suggested listing states:
`DRAFT → AVAILABLE → RESERVED → IN_RESCUE → COMPLETED`
Alternative terminal states: `EXPIRED`, `CANCELLED`, `UNAVAILABLE`.

Suggested assignment states:
`PENDING → ACCEPTED → AT_PICKUP → COLLECTED → AT_RECEIVER → DELIVERED`
Alternative terminal states: `DECLINED`, `CANCELLED`, `FAILED`, `EXPIRED`.

Record state transitions as events with actor, timestamp and reason. Use atomic conditional updates so two volunteers cannot claim the same assignment. A listing can have multiple partial allocations only if that behaviour is deliberately implemented and quantity accounting is transaction-safe; MVP may use one receiver/order per listing to reduce complexity.

## 10. Impact calculations

Show both raw inputs and calculation assumptions. Do not present estimates as independently verified environmental measurements.

Initial MVP calculations:
- `mealsSaved = sum(deliveredPortions)` for verified completed deliveries.
- `foodWasteAvoidedKg = sum(deliveredWeightKg)` where measured weight exists. If weight is estimated from portions, show the conversion factor and label it as an estimate.
- `estimatedEmissionsAvoidedKgCO2e = foodWasteAvoidedKg × configuredEmissionFactor` only if a credible factor is selected and documented. Otherwise omit this metric from the MVP rather than inventing a value.
- Distinguish posted, claimed, collected and delivered food. Only verified delivered quantities count as rescued meals.
- Version the assumptions used for every impact record so calculations can be audited.

## 11. UI system requirements

- All colour tokens live in `src/app/globals.css` (actual file `app/globals.css`; see AGENTS.md §11); the same forest/leaf/harvest palette is shared by the public landing page and every authenticated dashboard.
- Use semantic tokens and semantic utility classes mapped to those tokens.
- Never use raw palette classes such as `bg-red-100`, `text-blue-600`, `border-green-300`, arbitrary hex values or inline colour literals.
- Use shadcn/ui primitives and consistent dashboard shells.
- Use colour plus text/icon for statuses.
- Responsive, keyboard-accessible, labelled forms.
- Map views need a list alternative and legend.
- Use clear synthetic-data labels.
- No public display of real addresses or precise personal locations.
- No food-safety guarantee language.

See `AGENTS.md` for the complete Do/Don't rules.

## 12. Progress tracking

Update this table at the end of every phase. Do not mark a phase complete until its acceptance criteria and tests pass. The detailed checklists are in `addons.md`.

| Phase | Scope | Status | Completion evidence |
|---|---|---|---|
| 0 | Repository foundation, design tokens, env validation, database connection | ✅ Complete | Next.js App Router, Tailwind CSS, shadcn/ui, design tokens in `globals.css`. Neon PostgreSQL connected and verified with Drizzle ORM (`drizzle-kit push` and migration `0000_chubby_boomerang.sql`). Health check API `/api/health`. `.env.example` documented. TypeScript compilation passes. |
| 1 | Public landing page, Clerk auth, role onboarding and role dashboards | ✅ Complete | Landing page complete. Clerk auth integrated (`/sign-in`, `/sign-up` with Suspense streaming). Root `middleware.ts` configured. Role selection flow on `/onboarding` right after login for unassigned users, saving to Neon DB via `/api/onboarding/role`. Dedicated dashboard shells for donor, receiver, volunteer, and platform admin (`/dashboard/*`). Typecheck passes cleanly. |
| 1 (landing slice) | Tripti public landing page (spec in `addons.md`, Phase 1) | ✅ Complete (user sign-off) | CSS-only SaaS-style page, no photographs; components in `components/landing/`. Executed: `npm run build` PASSED, `/` prerenders as static. `npx tsc --noEmit` PASSED. |
| 2 | Donor listings, receiver needs, food metadata | ⬜ Not started | Listing created in under 60 seconds; validation works |
| 3 | Neon/PostGIS location model, Google Maps and Routes | ⬜ Not started | Synthetic markers and route/ETA work |
| 4 | Matching engine, claims and rescue order lifecycle | ⬜ Not started | Eligible matches ranked; concurrent claim protected |
| 5 | Volunteer availability polling and delivery tracking | ⬜ Not started | Polling/refetch states and OTP lifecycle work |
| 6 | Trigger.dev, email, expiry and notifications | ⬜ Not started | Scheduled expiry/reminders verified |
| 7 | Impact, Rescue Credits, admin and business model demo | ⬜ Not started | Impact formulas and ledger visible |
| 8 | QA, accessibility, security, demo seed data and deployment | ⬜ Not started | End-to-end demo and deployment checks pass |

### Phase status vocabulary
- `⬜ Not started`
- `🟡 In progress`
- `🧪 Testing`
- `✅ Complete`
- `⛔ Blocked`

### Progress update format
For each phase, record:
- Start date / completion date.
- Features completed.
- Files/modules/migrations added.
- Environment variables added.
- Tests and commands run, with results.
- Known issues and deferred work.
- Next phase.

## 13. Root memory.md handoff rule

After every completed phase or substantial vertical slice, create/update `/memory.md` with:

```md
# Project Memory

## Current project state
- Current phase:
- Overall status:
- Last updated:

## What has been built
- ...

## Important technical decisions
- ...

## Database / migrations
- ...

## Environment variables and integrations
- Names only; never include secret values.

## Tests run
- ...

## Known issues / limitations
- ...

## Next phase
- Phase number and exact first task:
- Prerequisites:
- Relevant section in docs/addons.md:
```

The agent must never invent completion evidence. If a phase is partial, say so and identify the exact next task.

## 14. Definition of done

A release/demo candidate is ready when:
- The donor → receiver → volunteer → delivery journey works end to end.
- Core matching and assignment rules are enforced server-side.
- Order lifecycle is auditable.
- Impact metrics are derived only from completed deliveries and show assumptions.
- Food handling metadata and disclaimer are visible.
- All roles have correct access controls.
- The UI follows the token system.
- Synthetic demo data is used.
- Critical tests, lint and typecheck pass.
- Vercel deployment and required environment variables are verified.
- `docs/scope.md`, `docs/addons.md` and `memory.md` are current.
