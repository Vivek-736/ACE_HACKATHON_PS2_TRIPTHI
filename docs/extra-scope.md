# Extra Scope — Quick Build Guide

A short, human-readable checklist. For full requirements, open `docs/scope.md` and the matching phase in `docs/addons.md` before coding.

## Before starting

```bash
node -v
npm -v
git status
npm run dev
```

Use **npm** consistently. Run each install command only when you reach that phase. If the project already has a package, do not install it twice. Add credentials to `.env.local`, never to source code or Git.

> Agent skills: install/read the official skill or documentation for the technology in that phase using your coding agent's own skill workflow. There is no universal `npx` install command; do not guess skill package names. The detailed playbook lists the skill topics.

---

## Phase 0 — Setup + design system

**Do:** Create the Next.js app, connect Neon/Drizzle, configure linting and build the reusable UI foundation. Create `globals.css` and define every colour token there.

**Install:**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install drizzle-orm @neondatabase/serverless zod
npm install -D drizzle-kit
npx shadcn@latest init
```

**How it should look:** Warm ivory background, forest-green primary buttons, leaf-green supporting accents, harvest-amber highlights, readable dark-green text. Consistent typography, spacing, borders, radii and button styles. Build reusable navbar, hero, section heading, metric, role card, CTA and footer components. No random hex colours or raw Tailwind colour classes.

**Finish when:** App runs, Neon connects, migrations work, tokens are centralised and `memory.md` is created.

## Phase 1 — Landing page + authentication

**Do:** Build the complete public landing page, Clerk sign-in/sign-up, role selection, onboarding and empty dashboard shells for Donor, Receiver, Volunteer and Admin.

**Install:**

```bash
npm install @clerk/nextjs react-hook-form @hookform/resolvers
```

**Landing page appearance:**
- **Navbar:** Brand/logo left; Discover, About, Impact; Sign in and a strong Get started button right. Responsive mobile menu.
- **Hero:** Large headline: “Rescue the surplus. Connect the willing. Deliver before it expires.” Short explanation and two CTAs. Show the rescue journey visually: food surplus → receiver → volunteer → delivered.
- **Discover section:** Food listing preview cards beside a small map/marker preview. Use synthetic demo locations only.
- **About section:** Human, simple explanation of the food-waste problem and the three roles; show the rescue flow rather than generic SaaS feature cards.
- **Impact section:** Meals rescued, food weight diverted and deliveries completed. Mark sample numbers as demo/illustrative; never invent live impact.
- **Footer/CTA:** Repeat Get started and link to Discover, About and Impact.

Keep the same Phase 0 colours and components. The page should feel trustworthy, clean, sustainable and spacious—not like a generic admin template.

**Finish when:** All landing links work; CTAs open Clerk auth; each role can onboard and reach its own protected dashboard.

## Phase 2 — Food listings + receiver needs

**Do:** Donors post surplus in under 60 seconds. Receivers set capacity/preferences, discover listings and request suitable food. Validate deadlines, quantity, storage and allergens.

**Install:** No new required package if Phase 0–1 dependencies are already installed. Use existing Drizzle, Zod, React Hook Form and shadcn/ui.

**How it should look:** Donor dashboard with a prominent “Post surplus” action, quick form and active-listing cards/table. Receiver dashboard with searchable/filterable food cards, clear portions, pickup deadline, storage/allergen details and Request action. Use visible Available, Reserved and Expired states.

**Finish when:** Donor can publish; receiver can request; expired or over-allocated food cannot be claimed.

## Phase 3 — Map + location

**Do:** Add synthetic donor, receiver and volunteer markers, nearby filtering and route/ETA display for a small shortlist. Use PostGIS where available, otherwise the documented distance fallback.

**Install:**

```bash
npm install @vis.gl/react-google-maps
npm install -D @types/google.maps
```

**Google setup:** Enable only Maps JavaScript API, Places API (New) if needed, and Routes API. Add exactly one `.env.local` variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Restrict it by website referrer and enabled APIs. Use browser-loaded Google Maps libraries only; do not create a server key or call Google web services from Route Handlers.

**How it should look:** Map with role/status markers and a legend: green available, blue on delivery, grey unavailable, orange awaiting pickup. Add filters and a list alternative. Never show real home addresses or private contact details.

**Finish when:** Map loads synthetic markers, filters work and route distance/ETA displays for selected candidates.

## Phase 4 — Matching + rescue assignment

**Do:** Build deterministic matching. Filter by food compatibility, quantity, deadline, distance, receiver need and volunteer availability/reliability. Let an eligible volunteer accept an assignment safely.

**Install:** No new package required. Use existing database, validation and server architecture.

**How it should look:** Matching results as ranked receiver/volunteer cards with match reason, distance, ETA, urgency and status. Rescue detail should show pickup → collected → delivered progress. Prevent two volunteers from claiming the same rescue.

**Finish when:** A listing can be matched, assigned once and moved through the order lifecycle.

## Phase 5 — Volunteer availability + delivery verification

**Do:** Add availability toggle, rescue opportunities, polling and pickup/delivery OTP verification. Refresh active screens every 10–15 seconds and invalidate queries after actions.

**Install:**

```bash
npm install @tanstack/react-query
```

**How it should look:** Volunteer dashboard with clear Available/Unavailable toggle, nearby rescue cards, active delivery panel, map and progress steps. Show last-updated/stale status. OTP confirmation screens should be simple and explicit.

**Finish when:** Availability persists, status refreshes, and pickup/delivery OTPs expire and cannot be reused. No Ably/WebSocket service is needed for this MVP.

## Phase 6 — Background jobs + notifications

**Do:** Expire overdue listings, send reminders, persist in-app notifications and email relevant status updates.

**Install:**

```bash
npm install @trigger.dev/sdk nodemailer
npm install -D @types/nodemailer
```

**Configure:** Trigger.dev project keys and SMTP provider credentials in `.env.local`. Nodemailer sends through your configured SMTP provider; Nodemailer is not itself an email delivery service.

**How it should look:** Notification list/dropdown with unread state, timestamps and useful links. Email templates should be clean, branded and concise, with food title, deadline and rescue status.

**Finish when:** Expiry/reminder jobs are idempotent and notifications appear in-app or arrive by configured email.

## Phase 7 — Impact + credits + admin + payment demo

**Do:** Calculate impact from verified deliveries, maintain a Rescue Credits ledger, build admin moderation/overview and add Razorpay test mode or clearly labelled simulated payments.

**Install only if implementing Razorpay:**

```bash
npm install razorpay
```

**How it should look:** Impact dashboard with metric cards, trends and visible calculation assumptions. Volunteer area with credit/earnings history. Admin dashboard with users, organisations, listings, orders, disputes and payment records. Clearly distinguish test/simulated payments from real payments.

**Finish when:** Only verified deliveries count as rescued, credits cannot duplicate and admin/payment operations are protected.

## Phase 8 — Testing + deployment

**Do:** Test complete donor → receiver → volunteer → pickup → delivery → impact flow. Check accessibility, privacy, role permissions, responsive UI and production environment variables. Deploy to Vercel.

**Install:**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install
```

**How it should look:** Polish every screen for mobile, tablet and desktop. Add proper loading, empty, error and success states. Keep the landing page visually consistent with the dashboards. Maps need a legend and list alternative.

**Run checks** (after corresponding scripts are configured):

```bash
npm run lint
npm run typecheck
npm run test
npx playwright test
npm run build
```

**Finish when:** The full demo works on the deployed URL, tests pass, synthetic data is used and known limitations are documented.

---

## After every phase

1. Run lint, typecheck and the relevant tests.
2. Mark the phase status in `docs/scope.md` and `docs/addons.md`.
3. Update root `memory.md`: what changed, files created, commands run, tests passed, environment variables added and next phase.
4. Commit the working phase before moving on.

**Rule:** Build one working end-to-end slice at a time. Do not install future-phase packages early or build every dashboard before the core rescue flow works.
