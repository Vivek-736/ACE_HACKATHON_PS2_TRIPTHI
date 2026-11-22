# AGENTS.md — Tripti (formerly Food Rescue Platform)

> **Purpose:** This is the project-wide operating contract for every AI coding agent and human contributor.
> Read this file before changing code. The detailed implementation plan lives in [`docs/scope.md`](docs/scope.md), and the feature-by-feature specifications, API requirements, acceptance criteria, and agent skill guidance live in [`docs/addons.md`](docs/addons.md).

## 1. Product identity

**Product name:** Tripti
**Former working name:** Food Rescue Platform (renamed 2026; see section 11)  
**Hackathon:** Codebenders ACE Builders Hackathon 2026  
**Problem statement:** Problem Statement 2 — Society and Environment, “Rescue the Surplus”.

### The problem

Restaurants, caterers, wedding venues, hostel messes and canteens regularly have edible surplus food. At the same time, nearby NGOs, community kitchens and shelters need food. Good intentions exist on both sides, but there is no sufficiently fast and reliable way to connect surplus food with people who can use it before it spoils. Food waste also contributes to greenhouse-gas emissions when it reaches landfills.

The challenge is to connect surplus food to nearby receivers within a short time window, coordinate pickup, and show measurable impact. The product must also make a credible business case for donors and sponsors.

### Why we are building this

We are building a **three-sided food-rescue coordination marketplace** that connects:

1. **Donors** — restaurants, caterers, hostel messes, canteens and event organisers that publish surplus food.
2. **Receivers** — NGOs, community kitchens and shelters that request or accept food according to their needs and capacity.
3. **Rescue volunteers** — registered individuals, including students, bachelors and working professionals, who can collect food from donors and deliver it to receivers.

An internal **Platform Admin** role supervises verification, listings, rescue operations, disputes, payment records and impact reporting.

The platform is not merely a map or a donation listing board. Its central value is coordinating a complete rescue journey:

**surplus posted → suitable receiver identified → volunteer assigned → food collected → food delivered → impact recorded.**

### Product promise

**Rescue the surplus. Connect the willing. Deliver before it expires.**

### Tripti positioning (2026)

- **Central idea:** "Good food deserves a better destination."
- **Trust line:** "Less waste. More meals. Stronger communities."
- **Purpose:** a coordinated food-rescue ecosystem, not merely a donation listing site. Donors publish surplus food, receivers (NGOs, shelters, community kitchens) discover suitable donations, volunteers handle transport, and verified deliveries feed measurable impact.
- **Target users:** donors (restaurants, caterers, hostels, food businesses), receivers (NGOs, shelters, community kitchens), and volunteers. The internal Platform Admin role is unchanged.
- **Workflow:** share surplus → find what the community needs → volunteer rescues and delivers → verified delivery → impact.

## 2. Non-negotiable problem-statement requirements

Every implementation phase must preserve these requirements:

- A donor must be able to publish a listing in under one minute.
- Matching must consider distance, quantity, timing and need.
- Pickup coordination must expose a lifecycle from `POSTED` to `CLAIMED` to `COLLECTED` to `DELIVERED`.
- The impact view must show meals saved and food waste avoided, including the assumptions used to calculate them.
- Every food listing must carry relevant handling information: time window, storage conditions and allergens.
- The platform connects people; it **does not certify food as safe**.
- Show clear handling guidance and time limits. Never imply that the platform inspected, approved or guaranteed food safety.
- Do not promise tax deductions, legal benefits or regulatory exemptions to donors.
- Use synthetic/demo data for the hackathon. Do not publish real addresses or personal details. Use anonymised identities and simulated coordinates in the public demo.

If a feature conflicts with these requirements, the requirements win.

## 3. Product roles and dashboard boundaries

### Donor
Can manage its organisation profile, publish and manage food listings, view eligible receivers and rescue volunteers, track pickups, view donation history and impact reports, and manage subscription/sponsorship information where enabled.

### Receiver
Can manage its organisation profile, set capacity and food preferences, discover eligible food, request/reserve quantities, track incoming deliveries, confirm receipt, and view received-food history and impact.

### Rescue Volunteer
Can manage profile, preferred rescue radius, availability and location-sharing consent; view eligible rescue opportunities; accept or decline assignments; follow pickup/delivery instructions; complete OTP verification; view completed deliveries, compensation records and Rescue Credits.

### Platform Admin
Can review organisation/volunteer applications, moderate listings, oversee active rescue orders, resolve reported issues, review payment/payout records, manage platform settings and inspect aggregate impact metrics.

### Authorization principles
- Authentication is not authorization. Enforce role and ownership checks on the server for every protected operation.
- A user must never access another organisation's private dashboard data by changing a URL or request payload.
- Volunteers should see only the location detail required for an accepted assignment. Do not expose private personal information.
- Public/demo maps must use synthetic coordinates and anonymised labels.
- Keep admin operations behind explicit server-side admin authorization.

## 4. Product scope and implementation references

Before starting any feature, read:

- [`docs/scope.md`](docs/scope.md) — product scope, architecture, phases, milestones, progress tracking and definition of done.
- [`docs/addons.md`](docs/addons.md) — detailed feature specifications, workflows, API contracts, environment variables, integration setup, testing, security notes and recommended skills for each phase.

**Do not begin a phase or vertical slice until its corresponding section in `docs/addons.md` has been read and its prerequisites are satisfied.**

When a phase or meaningful vertical slice is completed:

1. Run the relevant checks and tests.
2. Update the progress checkboxes and status in `docs/scope.md`.
3. Update the phase status and acceptance checklist in `docs/addons.md`.
4. Create or update the root-level [`memory.md`](memory.md).
5. In `memory.md`, record what was actually built, important decisions, migrations/env vars added, known limitations, test results, and the exact next phase/slice.
6. Do not claim a feature is complete if it is only scaffolded, mocked, or visually represented.
7. If the work is interrupted, record the current partial state in `memory.md` before handing off.

`memory.md` is a project handoff log, not a replacement for these specifications. Keep it factual and concise.

## 5. Technology decisions

Use this stack unless a documented decision is approved and recorded in `memory.md`.

| Area | Decision | Responsibility |
|---|---|---|
| Framework | Next.js App Router (current stable project version) | Web application and backend-for-frontend |
| Language | TypeScript, strict mode | Type safety |
| UI | React, Tailwind CSS, shadcn/ui | Accessible application UI |
| Authentication | Clerk | Sign-in, sign-up, session identity |
| Database | Neon PostgreSQL | Persistent application data |
| Spatial queries | PostGIS on Neon, if enabled and supported by the selected Neon setup | Nearby candidate filtering |
| ORM | Drizzle ORM | Schema, migrations and typed database access |
| Validation | Zod | Request and form validation |
| Forms | React Hook Form + Zod resolver | Typed form handling |
| Maps | Google Maps JavaScript API | Interactive map and markers |
| Places | Google Places API | Place search/autocomplete |
| Routes | Google Routes API | Route distance and ETA calculations |
| Client data refresh | TanStack Query polling + refetch after mutations | Near-live availability, listing and order updates without a realtime provider |
| Background jobs | Trigger.dev | Expiry, reminders and scheduled workflows |
| Email | Nodemailer + SMTP provider | Transactional email |
| Payments | Razorpay (test mode for hackathon) | Checkout/subscription/payment demonstration |
| Hosting | Vercel | Next.js deployment |
| Testing | Vitest or Jest, React Testing Library, Playwright | Unit, component and end-to-end tests |

### Architecture rules

- Next.js Route Handlers are the API boundary. Do not add FastAPI, NestJS or a separate Express server for this project.
- Keep business logic in service modules, not inside React components or large route-handler files.
- Use Drizzle for database access. Do not mix Drizzle with ad-hoc SQL throughout the application. Raw SQL is acceptable for carefully isolated PostGIS operations when necessary.
- Keep database schema and migrations version-controlled.
- Use transactions for operations that must be atomic, especially claiming a listing/assignment, changing order state, recording payment state and awarding credits.
- Neon is the source of truth. Use TanStack Query polling (10–15 seconds for active views) and invalidate/refetch relevant queries after mutations. Show last-updated/stale states. Do not add Ably or another realtime provider to the MVP.
- Use one Google Maps API key only: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Load Maps JavaScript, Places and Routes libraries in the browser. Restrict the key by allowed HTTP referrers and the exact APIs enabled in Google Cloud. Do not make server-side Google web-service calls or create a second Google key. Use PostGIS/Haversine on the server for candidate shortlisting; use the browser Routes library for route/ETA display on a small shortlist only.
- Use Trigger.dev for durable/scheduled background work; do not rely on in-memory timers in serverless route handlers.
- Do not add Redis, Socket.IO, a second backend, microservices or an AI agent unless a demonstrated requirement justifies it.
- Keep payment and payout workflows behind server-side interfaces so the hackathon demo can use test mode or simulated transactions without changing core order logic.

## 6. Required project organisation

Follow this separation. Adapt names only when there is a clear reason and record the change.

```text
.
├── AGENTS.md
├── memory.md                       # created/updated after each completed phase
├── docs/
│   ├── scope.md
│   └── addons.md
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── (donor)/
│   │   ├── (receiver)/
│   │   ├── (volunteer)/
│   │   ├── (admin)/
│   │   └── api/
│   ├── components/
│   │   ├── ui/                     # shadcn primitives
│   │   ├── shared/
│   │   ├── maps/
│   │   └── dashboards/
│   ├── features/
│   │   ├── auth/
│   │   ├── organisations/
│   │   ├── listings/
│   │   ├── matching/
│   │   ├── volunteers/
│   │   ├── rescue-orders/
│   │   ├── impact/
│   │   ├── payments/
│   │   └── admin/
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── maps/
│   │   ├── query/
│   │   ├── payments/
│   │   ├── email/
│   │   ├── env/
│   │   └── utils/
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── policies/
│   │   └── jobs/
│   ├── db/
│   │   ├── schema/
│   │   └── migrations/
│   └── types/
├── drizzle.config.ts
├── package.json
└── ...
```

Feature modules should own their schemas, types, service logic and UI where practical. Shared components must not contain donor-, receiver- or volunteer-specific business rules.

**Deliberate deviation — repo-root layout (2026):** the application uses `app/`, `components/` and `public/` at the repository root instead of under `src/`. Reason: the existing scaffold is built this way, and moving it would add churn with no product benefit. Route groups `(auth)` and `(dashboard)` are planned but not yet present. The `(marketing)`, `(donor)`, `(receiver)`, `(volunteer)` and `(admin)` groups above remain planned. Paths written as `src/...` elsewhere in this document are not yet reconciled with this layout. See section 11.

## 7. UI and design-system rules

### Centralised design tokens
- **All colour tokens must be defined in `src/app/globals.css`** (actual file: `app/globals.css`; see section 11) using CSS custom properties. Establish the sustainability-inspired brand palette in Phase 0 and apply it consistently to the public landing page and every dashboard.
- Define semantic tokens for background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, success, warning, info and chart colours.
- Define a polished light theme first. Use a warm ivory canvas, deep forest-green primary, fresh leaf-green secondary, restrained harvest-amber accent, and neutral ink/surface colours. Add dark theme only if explicitly required; do not spend hackathon time on a second theme unless the product scope calls for it.
- Components must consume semantic tokens through the design system and Tailwind theme mapping.
- If a new colour is needed, add or extend a semantic token in `globals.css`; do not introduce one-off colours in component markup.
- Keep typography, radii, shadows and spacing decisions centralised where appropriate.
- **Typography (2026):** Geist and Geist Mono are loaded with `next/font/google` in `app/layout.tsx` (variables `--font-geist-sans` and `--font-geist-mono`). Do not add further font families without recording a decision.

### Brand and landing-page assets (2026)
- `public/logo.svg` (Tripti emblem) is the logo; `public/favicon.svg` is the favicon.
- Imagery must be documentary-style, royalty-free photography from Unsplash or Pexels: restaurants packing surplus food, volunteers packing or transporting it, community kitchens, NGO teams, fresh food and realistic handoffs.
- Do not use Drift assets, AI-generated filler, or imagery that implies poverty or disrespects recipients.
- Configure `next/image` `remotePatterns` for each chosen host and record the source and licence of every image.
- Overlays and text-over-image scrims use semantic tokens from `globals.css`, not literal colours.

### Do
- Use semantic classes backed by CSS variables, such as `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `text-destructive` and project-defined semantic classes.
- Use shadcn/ui components as accessible primitives and customise them through tokens.
- Build consistent dashboard shells, navigation, page headers, empty states, loading states and error states.
- Use responsive layouts and test mobile, tablet and desktop.
- Use accessible labels, keyboard navigation, focus indicators, contrast and meaningful status text.
- Use consistent status badges for listing/order states.
- Use skeletons for loading data and explicit empty/error states.
- Use icons consistently; pair ambiguous icons with text.
- Use map legends and a list alternative to map-only information.
- Make destructive actions explicit and confirm them.

### Don't
- **Do not use raw palette utility classes** such as `bg-red-100`, `text-blue-600`, `border-green-300`, `bg-[#123456]` or arbitrary one-off colour values.
- Do not hardcode hex/rgb/hsl colours in components, inline styles, charts or SVGs. Put colours in `globals.css` tokens and consume semantic variables.
- Do not use arbitrary Tailwind values as a shortcut for design tokens.
- Do not build a giant component containing all dashboard logic.
- Do not use colour alone to communicate order state; include labels/icons.
- Do not create fake charts or metrics that appear to be real production data. Clearly label synthetic demo data.
- Do not show exact personal addresses or volunteer live coordinates in public demo views.
- Do not claim a food-safety certification, tax benefit or legal benefit.

### Component conventions
- Prefer server components by default.
- Add `"use client"` only where state, browser APIs, maps or interactive form controls require it.
- Keep map components isolated behind client components and load browser-only Google Maps code safely.
- Keep forms typed and Zod-validated.
- Avoid prop drilling through many levels; use feature-level composition and narrowly scoped context when justified.

## 8. API and environment-variable safety

- Commit `.env.example` with variable names and safe placeholders only.
- Never commit `.env`, service-role secrets, webhook secrets, private keys or real credentials.
- Never expose server secrets through `NEXT_PUBLIC_` variables.
- The single `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is browser-visible by design; restrict it to approved HTTP referrers and the Maps JavaScript, Places and Routes APIs.
- Do not create or use a server-side Google Maps key; keep all Google Maps library calls in the browser.
- Verify Clerk identity and role on every protected server request.
- Verify Razorpay signatures server-side. Never trust a client-reported payment success.
- Polling endpoints must enforce Clerk authentication, role and resource ownership; never expose another organisation or volunteer private data.
- Validate webhook signatures and make webhook handlers idempotent.
- Rate-limit sensitive endpoints such as OTP verification, listing creation, claims and payment initiation.
- Store only the minimum personal data required.
- Use synthetic records in the hackathon demo.

See `docs/addons.md` for the exact environment-variable inventory and phase-specific setup.

## 9. Engineering workflow for every phase

Before coding:
1. Read `AGENTS.md`, `docs/scope.md`, the relevant phase in `docs/addons.md`, and the latest `memory.md` if it exists.
2. Confirm the phase's prerequisites, credentials, required skills and acceptance criteria.
3. Inspect the existing codebase. Do not overwrite working architecture or duplicate existing features.
4. Propose the smallest vertical slice that demonstrates end-to-end behaviour.
5. Identify schema changes, API contracts, UI states, security policies and tests before implementation.

While coding:
1. Implement one feature slice at a time.
2. Keep types, validation, service logic, repositories and UI separated.
3. Add loading, empty, error, success and permission-denied states.
4. Add migrations and update `.env.example` when required.
5. Keep synthetic/demo data clearly distinguishable from real data.
6. Do not silently substitute a mock for an integration. Label it as a mock and document the remaining work.

After coding:
1. Run formatting, lint, typecheck, unit tests and relevant end-to-end tests.
2. Test both authorised and unauthorised access.
3. Test failure paths, duplicate requests, expired listings and concurrent claims where relevant.
4. Review responsive UI and keyboard accessibility.
5. Update phase checklists in `docs/scope.md` and `docs/addons.md`.
6. Create/update root `memory.md` with actual completion evidence and the next phase.
7. Report any unfinished items honestly.

## 10. Definition of done

A feature is complete only when:
- The user journey works from UI to API to database (unless explicitly marked as a prototype/mock).
- Server-side authorization and validation exist.
- Relevant loading, empty, error and success states exist.
- Database migrations are included.
- Tests cover core business rules and important failure paths.
- No secrets or real personal details are committed.
- UI follows `globals.css` token rules.
- Documentation and progress tracking are updated.
- `memory.md` records what was built and what comes next.

## 11. Decision log policy

When changing a major decision (database, auth, client-refresh strategy, map provider, payment provider, routing, role model or business model):

- Explain the reason and trade-offs.
- Update `docs/scope.md` and `docs/addons.md`.
- Record the decision and date in `memory.md`.
- Check whether environment variables, data model, security rules and tests need updating.

### Decision entries (2026)

- **2026 — Product renamed to Tripti.** Previous working name: "Food Rescue Platform". Reason: brand identity for the public landing page and launch. Trade-off: the working name remains in history and in any repository or package identifiers this record does not change. Updated in this change: `AGENTS.md`, `docs/scope.md`, `docs/addons.md` (Phase 1 landing-page slice). Pending: record in `memory.md` at its next update. This change did not edit `memory.md`.
- **2026 — Landing-page spec recorded (implementation pending).** Central idea, trust line, eight-section order, metadata, imagery rules and interaction rules are recorded in `docs/addons.md` (Phase 1, public landing page slice). Status: in progress, not complete. Trade-off: the hero uses one full-width photo with a dark overlay rather than a composed journey collage. The rescue journey is shown in the How Tripti Works section instead. This supersedes the earlier Phase 1 wording on the hero, the Discover/About/Impact navigation and the Discover section.
- **2026 — Repo-root layout deviation.** Spec and this document write `src/app/globals.css`, `src/...` feature folders and `src/app` route groups. The actual layout is `app/globals.css`, `app/layout.tsx`, `components/ui`, `public/`. Reason: the scaffold already uses this layout, and moving it adds churn with no product benefit. Consequence: `src/` paths in this document are not yet reconciled. Follow-up: before Phase 1 auth routes are added, either move the scaffold to `src/` or update the paths in this document. Not changed silently.
- **2026 — Metadata and footer scope.** Metadata: title "Tripti — Rescue Food. Share Hope.", OpenGraph type `website`, Twitter card, icon from `public/favicon.svg`. `metadataBase` is omitted because no production domain is known; add it when the domain is set via `NEXT_PUBLIC_APP_URL`. Footer: Privacy and Terms links are omitted until those routes exist. No social links are shown unless configured.
- **2026 — Image hosts.** Unsplash or Pexels are the sources. The exact `remotePatterns` hosts are not chosen yet and must be recorded when images are selected.

**Do not silently change the stack or product scope.**

<!-- TRIGGER.DEV SKILLS START -->
## Trigger.dev agent skills

This project has Trigger.dev agent skills installed in `.agents/skills/`. Before writing or changing Trigger.dev code (background tasks, scheduled tasks, realtime, or chat.agent AI agents), load the most relevant skill: `trigger-cost-savings`, `trigger-realtime-and-frontend`, `trigger-authoring-chat-agent`, `trigger-chat-agent-advanced`.
<!-- TRIGGER.DEV SKILLS END -->
