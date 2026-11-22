# Tripti — Judge Demo Runbook & Presentation Guide
**Hackathon:** Codebenders ACE Builders Hackathon 2026  
**Problem Statement:** Problem Statement 2 — Society and Environment, "Rescue the Surplus"  
**Positioning:** *"Good food deserves a better destination. Less waste. More meals. Stronger communities."*

---

## 1. Quick Executive Pitch (30 seconds)

Restaurants, caterers, and banquet halls frequently discard wholesome, edible food simply because there is no fast, reliable coordination mechanism to move surplus to shelters before it spoils.

**Tripti** is an end-to-end, 3-sided coordinated food rescue marketplace connecting:
1. **Donors:** Commercial kitchens, restaurants, and caterers publishing surplus in under 60 seconds.
2. **Receivers:** Accredited NGOs, shelters, and community kitchens receiving food matched to their capacity.
3. **Rescue Volunteers:** Registered couriers transporting surplus food with cryptographic double-OTP chain of custody.

The platform is **100% free** for basic food rescue and receivers, financially sustained through a **B2B SaaS subscription for commercial kitchen waste analytics** (saving kitchens ~18% in procurement overproduction) and **CSR logistics sponsorships**.

---

## 2. Recommended 3-Minute Live Demo Walkthrough

### Part 1: The 60-Second Surplus Post (Donor Perspective)
- **URL:** [`/dashboard/donor`](file:///d:/FY_Projects/tripthi/app/dashboard/donor/page.tsx)
- **Action:**
  1. Click the glowing **"Post Surplus Food"** button to open the Quick Post modal.
  2. Select a 1-click preset (e.g., *Biryani & Curry* or *Fresh Chapatis*).
  3. Notice the multi-city location selector: choose **Vijayawada (Benz Circle)**, **Visakhapatnam (Siripuram)**, or **Hyderabad (Cyber Pearl, Madhapur)**.
  4. Note mandatory food safety standards: storage temperature (Hot holding $\ge 65^\circ\text{C}$), allergen declaration, and non-negotiable food safety disclaimer.
  5. Click **"Publish Surplus Listing"** — listing is live in under 45 seconds!

### Part 2: Spatial Proximity & Deterministic Matching (Receiver Perspective)
- **URL:** [`/dashboard/receiver`](file:///d:/FY_Projects/tripthi/app/dashboard/receiver/page.tsx)
- **Action:**
  1. Inspect the **Rescue Map Dual-View** showing nearby donors, community needs, and active couriers.
  2. The algorithmic matching engine evaluates distance, urgency, capacity fit, and dietary constraints.
  3. The receiver discovers the surplus listing and places a portion request/reservation.

### Part 3: Live Courier Dispatch & Double-OTP Handoff (Volunteer Perspective)
- **URL:** [`/dashboard/volunteer`](file:///d:/FY_Projects/tripthi/app/dashboard/volunteer/page.tsx)
- **Action:**
  1. The volunteer receives the assignment with route distance, ETA, and pickup deadline.
  2. **Stage 1 (Pickup Handoff):** Volunteer arrives at donor kitchen. Donor reveals the 6-digit **Pickup OTP** (e.g., `482910`). Volunteer enters OTP → status updates to **Collected**!
  3. **Stage 2 (Delivery Handoff):** Volunteer arrives at the shelter. Receiver inspects and provides the 6-digit **Delivery OTP** (e.g., `719304`). Volunteer enters OTP → status updates to **Delivered**!
  4. Notice the **Rescue Credit Ledger**: +50 credits awarded immediately with gamified tier progress (**Bronze Scout → Silver Rescuer → Gold Community Guardian**).
  5. Anti-replay check: Attempts to reuse already-consumed OTPs or duplicate credits are automatically blocked.

### Part 4: B2B Monetization, Pro Analytics & Scope 3 ESG Audit (Donor Perspective)
- **URL:** [`/dashboard/donor/analytics`](file:///d:/FY_Projects/tripthi/app/dashboard/donor/analytics/page.tsx)
- **Action:**
  1. Open the **Pro Kitchen Intelligence & ESG Workspace**.
  2. Inspect the **Day-of-Week Kitchen Overproduction Heatmap**:
     - Highlights that Friday and Sunday dinner batches generate 62% of weekly surplus.
     - Actionable Executive Chef Recommendation: Advises trimming afternoon prep by 18–22 portions to save ~₹3,400/weekend in food procurement without stockouts.
  3. Review the **Scope 3 Carbon Offset & Agricultural Water Metrics** (185 L embedded water saved per portion).
  4. Inspect the **Official Scope 3 ESG Audit Certificate** (Serial Number: `TRIPTI-ESG-2026-MADHAPUR`) and click **"Print / Save ESG Certificate (PDF)"** for audit-ready CSR/BRSR compliance.
  5. Click **"Upgrade to Pro"** to demonstrate the official **Razorpay Checkout Dialog** with test mode simulation.

### Part 5: Platform Admin Operations & Governance (Admin Perspective)
- **URL:** [`/dashboard/admin`](file:///d:/FY_Projects/tripthi/app/dashboard/admin/page.tsx)
- **Designated Admin Account:** `vivek338614@gmail.com`
- **Action:**
  1. Inspect the **Organization Verification Desk**: Review pending NGO and restaurant partner applications, and approve/reject credentials.
  2. Review the **Rescue Operations Desk**: Monitor active in-flight missions and resolve any flagged issues.
  3. Inspect the **Financial & Credit Ledger**: Transparent log of all CSR sponsorships, Pro subscriptions, and volunteer credits.

---

## 3. Seeded Demo Accounts & Locations Reference

Run `node scripts/seed-demo.mjs` anytime to reset or restore the complete synthetic demo state:

| Role | Synthetic Organization / Name | Location / City | Demo Key Features |
|---|---|---|---|
| **Donor** | Krishna Grand Banquets & Caterers | Benz Circle, Vijayawada | Active surplus listing, Pro analytics active |
| **Donor** | Bay View Convention & Dining Hub | Siripuram, Visakhapatnam | Fresh 65-portion lunch listing, CSR sponsorship |
| **Donor** | Paradise Food Court | Cyber Pearl, Madhapur, Hyd | 80-portion Biryani listing, Enterprise ESG |
| **Receiver** | Amma Vodi Destitute Home & Kitchen | Governorpet, Vijayawada | Active request for 40 portions dinner |
| **Receiver** | Preeti Children Shelter & Care Home | MVP Colony, Visakhapatnam | Active request for 50 children's meals |
| **Receiver** | Sneha Orphanage & Community Kitchen | Begumpet, Hyderabad | Active request for 60 portions supper |
| **Volunteer** | Sai Kumar | Benz Circle, Vijayawada | Active Courier (Motorcycle), 180 Credits |
| **Volunteer** | Ravi Varma | MVP Colony, Visakhapatnam | Active Courier (Motorcycle), Silver Tier (350 Credits) |
| **Volunteer** | Pavan Teja | Cyber Pearl, Madhapur, Hyd | Active Courier (Motorcycle), 90 Credits |
| **Admin** | Platform Operator (`vivek338614@gmail.com`) | Central Platform Console | Full governance, moderation & payout supervision |

---

## 4. Key Architectural & Compliance Highlights

- **Single Maps Browser Key:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` loads Maps JS, Places, and Routes in the browser; Haversine and bounding-box queries run server-side.
- **Durable Background Tasks:** Trigger.dev SDK handles automated listing expiry and volunteer reminders.
- **Strict Privacy Protection:** Public maps and demo consoles use synthetic coordinates and anonymized labels. No personal residential coordinates are exposed.
- **Food Safety Disclaimer:** Present on all touchpoints. The platform coordinates logistics and transparently disclaims food certification or false tax promises.
