# Project Memory — Tripthi

## Current state
- **Phase:** Phase 1 public landing slice is **complete** (user sign-off). Phase 1 proper (auth, onboarding, role dashboards) and Phases 0 and 2–8 are not started.
- **Built (files):**
  - `components/landing/Navbar.tsx`
  - `components/landing/HeroSection.tsx`
  - `components/landing/DashboardPreview.tsx`
  - `components/landing/HowItWorksSection.tsx`
  - `components/landing/FeaturesSection.tsx`
  - `components/landing/ImpactSection.tsx`
  - `components/landing/CallToAction.tsx`
  - `components/landing/Footer.tsx` (`async`; year comes from a `"use cache"` helper)
  - `app/page.tsx` (wires the sections; `MissionSection` removed)
  - `app/layout.tsx` (metadata: title, description, OpenGraph `website`, Twitter card, icon `public/favicon.svg`)
  - `app/globals.css` (colour tokens; `tripthi-rise` keyframe; thin scrollbar; smooth in-page scroll)
  - `next.config.ts` (`images.remotePatterns` for `images.unsplash.com` and `images.pexels.com`; unused)
- **Docs updated:** `docs/scope.md` (landing row marked ✅ Complete with verification evidence), `docs/addons.md` (Phase 1 landing slice ✅ Complete, with a verified/unverified record). Phase 1 proper is still ⬜ Not started in both files.

## Decisions
- The landing page is CSS-only with no photographs (user request). The earlier photo-based design is superseded.
- Colour tokens: warm ivory background, deep forest-green primary, leaf-green secondary, harvest-amber accent, neutral ink/surface. All defined in `app/globals.css`.
- The app lives in the repo-root `app/`, `components/` and `public/` folders, not `src/` (deviation recorded in AGENTS.md §11).
- Footer year comes from a cached `getCopyrightYear` helper (`"use cache"`; `cacheComponents` is on) so `new Date()` is not called during prerender.
- Thin, near-invisible scrollbar, and smooth in-page scroll with a 4rem `scroll-margin-top` on sections so headings clear the sticky navbar.
- The landing slice was signed off by the user as complete while the browser, responsive, accessibility and lint checks listed below remain open. This is recorded as a user decision, not as verification.

## Verification status
- **Executed and passed:**
  - `npm run build` PASSED. The `/` route prerenders as static. The earlier `new Date()` during-prerender error (`Footer.tsx`) no longer occurs.
  - `npx tsc --noEmit` PASSED across the project.
- **Executed and failed (out of scope):**
  - `npm run lint` FAILED repo-wide (exit 1). Errors, all `react-hooks/set-state-in-effect`: `components/ui/carousel.tsx:98`, `components/ui/liquid-glass.tsx:114`, `hooks/use-mobile.ts:14`. Warning: `components/ui/input-group.tsx:59`. ESLint on the landing components, `app/page.tsx`, `app/layout.tsx` and `next.config.ts` was clean. Not yet determined whether these predate the landing work.
- **Tests:** none. The project has no test script, and no tests exist for the landing page.
- **Not verified:**
  - No browser check of the landing page: layout, mobile/tablet/desktop responsiveness, the dashboard preview's no-overflow at 375px, and scrollbar/smooth-scroll behaviour. All CSS-only and unobserved.
  - No keyboard or accessibility audit beyond the focus-ring classes written in.
  - Lucide icon names are not all checked against `node_modules`. The build passing implies the imports resolve; icon-only checks are unconfirmed.

## Known gaps
- No Privacy or Terms routes, so those links are omitted.
- No `metadataBase` (no production domain known). Add it via `NEXT_PUBLIC_APP_URL` once the domain is set.
- Dashboard preview is fictional demo data only; impact figures are labelled demo figures.
- `/sign-in` and `/sign-up` are linked but their existence was not confirmed in this pass.
- `docs/extra-scope.md` still describes the older photo-based landing page; not updated.
- `public/images/` is not used by the landing page. `next.config.ts` still allows `images.unsplash.com` and `images.pexels.com` (harmless, unused).

## Next steps
1. Fix or triage the repo-wide lint errors in `components/ui` and `hooks` (`carousel.tsx`, `liquid-glass.tsx`, `use-mobile.ts`, and the `input-group.tsx` warning). Confirm whether they predate the landing work.
2. Run a browser and responsive check of `/` at mobile, tablet and desktop widths. Include the dashboard preview at 375px (no horizontal overflow) and the scrollbar and smooth-scroll behaviour.
3. Confirm the `/sign-in` and `/sign-up` routes exist, or adjust the links.
4. Run an accessibility pass: keyboard navigation, mobile menu Escape and focus return, and Lucide icon-name checks.
5. Decide on `docs/extra-scope.md` (update it or retire it).
