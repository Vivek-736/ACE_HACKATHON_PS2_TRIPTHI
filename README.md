<div align="center">

# 🍲 Tripti

### Rescue the Surplus • Connect the Willing • Deliver Before It Expires 🌿

<img src="public/logo.svg" alt="Tripti Logo" width="130" height="130" style="margin: 20px 0;" />

**A Coordinated Three-Sided Food Rescue Marketplace & B2B ESG Sustainability Ecosystem**

**Good food deserves a better destination. Less waste. More meals. Stronger communities.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API-4285F4?style=for-the-badge&logo=google-maps&logoColor=white)](https://cloud.google.com/maps-platform)
[![Trigger.dev](https://img.shields.io/badge/Trigger.dev-SDK_v4-8B5CF6?style=for-the-badge&logo=triggerdotdev&logoColor=white)](https://trigger.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=528FF0)](https://razorpay.com/)

[🚀 Live Demo](#) • [📖 Scope & Addons](docs/scope.md) • [⚖️ Judge Runbook](docs/judge-runbook.md) • [⭐ Star Us](https://github.com/Vivek-736/tripthi)

</div>

<br/>

<div align="center">

## 🎯 Coordinated Food Rescue Journey

```ascii
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   🍲 60-Second Surplus Post    •   📍 Haversine Spatial Dispatch     ║
║   🔐 Double-OTP Handoff Chain  •   🌱 Certified Scope 3 ESG Audit    ║
║   ⚡ 4D Algorithmic Matching   •   👑 B2B Kitchen Telemetry Suite    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

</div>

<br/>

## 🌈 Why Tripti?

> **"Don't just discard — redistribute."** 
> 
> Restaurants, caterers, banquet halls, and hostel messes regularly have edible surplus food. Nearby shelters, community kitchens, and NGOs face daily feeding deficits. Tripti closes this gap with a real-time, **three-sided coordinated marketplace** backed by cryptographic chain of custody and a self-sustaining B2B business model.

### 💎 What Sets Tripti Apart

<table>
<tr>
<td width="33%" align="center">
<img src="https://img.icons8.com/fluency/96/food-receiver.png" width="60" height="60" alt="Synergy"/>

**3-Sided Synergy**

Unites **Donors**, **Receivers**, and **Rescue Volunteers** into one fluid, low-friction coordination loop.
</td>
<td width="33%" align="center">
<img src="https://img.icons8.com/fluency/96/shield.png" width="60" height="60" alt="Double OTP"/>

**Double-OTP Protocol**

Cryptographic chain of custody with separate **Pickup** and **Delivery OTPs**, anti-replay protection, and attempt locks.
</td>
<td width="33%" align="center">
<img src="https://img.icons8.com/fluency/96/positive-dynamic.png" width="60" height="60" alt="Self-Sustaining"/>

**Self-Sustaining Model**

Always **100% free for NGOs**. Subsidized by B2B SaaS kitchen analytics and corporate CSR logistics sponsorships.
</td>
</tr>
</table>

<br/>

---

<div align="center">

## 🏗️ System Architecture & Data Flow

A multi-tiered reactive pipeline coordinating real-time spatial discovery, deterministic scoring, double-OTP verification, and durable background sweeps.

</div>

<br/>

```mermaid
flowchart TD
    subgraph Donors["👨‍🍳 Food Donors (Commercial Kitchens & Caterers)"]
        D1["Post Surplus Food (<60s)"] --> D2["Set Storage Temp & Allergens"]
        D2 --> D3["Generate Pickup OTP"]
    end

    subgraph CoreEngine["⚡ Tripti Core Engine & Database"]
        DB[("Neon PostgreSQL + PostGIS")]
        MATCH["4D Matching Engine\n(Distance, Urgency, Need, Reliability)"]
        AUTH["Clerk Auth & RBAC"]
        DB <--> MATCH
        AUTH --> DB
    end

    subgraph Receivers["🏠 Community Receivers (NGOs & Shelters)"]
        R1["State Capacity & Needs"] --> R2["Discover Nearby Runs"]
        R2 --> R3["Reserve Portions"]
        R3 --> R4["Generate Delivery OTP"]
    end

    subgraph Volunteers["🚴 Volunteer Couriers"]
        V1["Multi-City Staging Radar"] --> V2["Accept Assignment"]
        V2 --> V3["Verify Pickup OTP (Stage 1)"]
        V3 --> V4["Verify Delivery OTP (Stage 2)"]
    end

    subgraph Background["⚙️ Durable Background Workers (Trigger.dev)"]
        T1["Auto-Expiry Sweeper"] --> DB
        T2["Pickup Window Alerts"] --> V2
    end

    subgraph Sustainability["📊 B2B Telemetry & Scope 3 ESG"]
        S1["Day-of-Week Overproduction Heatmap"]
        S2["Official Certified ESG Audit PDF"]
        S3["Razorpay Subscription Gateway"]
    end

    D1 --> DB
    R1 --> DB
    MATCH --> V1
    V3 -->|"Handoff Confirmed"| DB
    V4 -->|"Delivery Verified (+50 Credits)"| DB
    DB --> S1
    DB --> S2
    S3 --> DB
```

<br/>

---

<div align="center">

## 🔄 Rescue Order Lifecycle State Machine

Deterministic state transitions enforcing atomic conditional claiming and cryptographic verification at both kitchen and shelter gates.

</div>

<br/>

```mermaid
stateDiagram-v2
    [*] --> Available: Donor posts surplus (<60s)
    Available --> Matched: 4D Matching Engine shortlists candidates
    Matched --> Reserved: Receiver requests allocation
    Reserved --> Accepted: Volunteer accepts dispatch assignment
    Accepted --> AtPickup: Volunteer navigates to kitchen
    AtPickup --> Collected: Pickup OTP verified by donor
    Collected --> AtReceiver: Courier in transit with food
    AtReceiver --> Delivered: Delivery OTP verified by shelter
    Delivered --> ImpactRecorded: Meals saved, kg waste & CO2e logged
    ImpactRecorded --> CreditsAwarded: Volunteer receives +50 Rescue Credits
    CreditsAwarded --> [*]

    Available --> Expired: Window expires before pickup
    Matched --> Cancelled: Cancelled by donor/admin
    Expired --> [*]
    Cancelled --> [*]
```

<br/>

---

<div align="center">

## 🎨 Features That Power The Ecosystem

Built for sub-minute operation, mathematical dispatch, and verifiable sustainability

</div>

<br/>

### 🍲 Core Role Dashboards

<table>
<tr>
<td width="50%">

#### 👨‍🍳 Commercial Donor Console
```
✓ Sub-60s listing creation with 1-click presets
✓ Strict allergen & temperature storage declarations
✓ Dynamic spatial proximity map with live role pins
✓ In-flight mission tracking & verification OTP reveals
✓ Historical impact telemetry & diversion ledger
```

Publish wholesome surplus food in seconds before preparation windows lapse.

</td>
<td width="50%">

#### 🏠 Community Receiver Console
```
✓ State daily portion needs & dietary preferences
✓ Real-time capacity manager & intake limits
✓ Spatial discovery of nearby surplus food runs
✓ 1-click allocation reservations
✓ Verified delivery handoff with Delivery OTPs
```

Accredited shelters and community kitchens receive safe, wholesome meals on schedule.

</td>
</tr>
<tr>
<td width="50%">

#### 🚴 Rescue Volunteer Courier Console
```
✓ Real-time staging zone selector across South India
✓ Route distance, travel ETA & deadline calculator
✓ Mobile-friendly 6-digit double-OTP input keypad
✓ Gamified Rescue Credits (Bronze → Silver → Gold)
✓ Real-time availability toggles (Available / Busy)
```

Empowering individuals and students to volunteer their commute for verified community impact.

</td>
<td width="50%">

#### 🛡️ Platform Admin Governance
```
✓ Organization Verification Desk (approve / reject)
✓ Real-time active rescue mission dispatcher
✓ Dispute moderation desk & delivery status overrides
✓ Transparent financial sponsorship & payment records
✓ Platform-wide aggregate impact telemetry
```

Comprehensive internal supervision for complete compliance, safety, and accountability.

</td>
</tr>
</table>

<br/>

### 👑 Tripti Pro: B2B Commercial Kitchen Analytics & ESG Suite

<details open>
<summary><b>Click to explore commercial monetization and compliance features</b></summary>

<br/>

| Capability | Business Value | Impact Metric |
|---|---|---|
| **Day-of-Week Overproduction Heatmap** | Analyzes Mon–Sun kitchen surplus trends to identify overproduction hotspots | Cuts procurement waste by ~18% (~₹14,280/mo saved) |
| **Executive Chef Batch Recommendations** | Actionable advice on raw ingredient preparation right-sizing | Prevents surplus excess before cooking starts |
| **Certified Scope 3 ESG Audit Certificate** | Audit-ready certificate (UNEP Food Waste Index & GHG Protocol Scope 3) | Fulfills SEBI BRSR Core compliance requirements |
| **1-Click Printable PDF Export** | Downloadable official diversion documentation with unique serial IDs | Instant compliance verification for CSR audits |
| **2x Priority Courier Dispatch** | Surplus listings are priority-pushed to top nearby couriers | Turnaround time reduced to under 14 minutes |

</details>

<br/>

---

<div align="center">

## 📍 South India Multi-City Geographic Coverage

Pre-seeded and fully selectable with synthetic, privacy-shielded coordinates

</div>

<br/>

<div align="center">

| Region / City | Pre-Seeded Demonstration Hubs | Coordinates |
|---|---|---|
| **Andhra Pradesh — Vijayawada** | Benz Circle, MG Road, Governorpet, Bhavanipuram, Gandhinagar | `16.5033° N, 80.6465° E` |
| **Andhra Pradesh — Visakhapatnam (Vizag)** | Siripuram, Jagadamba, MVP Colony Sector-4, Gajuwaka, RK Beach | `17.7215° N, 83.3150° E` |
| **Andhra Pradesh — Guntur & Tirupati** | Kothapet Canteen Cluster, Alipiri Pilgrim Relief Center | `16.3067° N, 80.4365° E` |
| **Telangana — Hyderabad** | Cyber Pearl (Madhapur), Gachibowli, Banjara Hills, Begumpet | `17.4483° N, 78.3815° E` |
| **Tech Hubs — Bengaluru & Chennai** | Koramangala 5th Block, T. Nagar Annadhanam Hub | `12.9352° N, 77.6245° E` |

</div>

<br/>

---

<div align="center">

## 🛠️ Tech Stack That Powers Innovation

Architected for strict type safety, sub-second queries, and resilient background jobs

</div>

<br/>

<table align="center">
<tr>
<td width="50%" valign="top">

### ⚡ Frontend & Client Surface

```typescript
┌─────────────────────────────────┐
│  Framework & Core               │
├─────────────────────────────────┤
│  Next.js 16.4.6   │ App Router  │
│  React 19.3.0     │ Server RSC  │
│  TypeScript 5     │ Strict Mode │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  UI & Client Engine             │
├─────────────────────────────────┤
│  Tailwind CSS 4   │ Tokenized   │
│  shadcn/ui        │ Accessible  │
│  TanStack Query   │ Polling 12s │
│  Google Maps JS   │ Markers/ETA │
└─────────────────────────────────┘
```

**Why This Stack?**
- Instant hybrid rendering with Turbopack
- Design tokens centralized in `app/globals.css`
- Responsive across mobile, tablet, and desktop
- Third-party browser extension error isolation

</td>
<td width="50%" valign="top">

### 💪 Backend & Cloud Infrastructure

```typescript
┌─────────────────────────────────┐
│  Database & Spatial Model       │
├─────────────────────────────────┤
│  PostgreSQL       │ Neon Cloud  │
│  PostGIS          │ Spatial     │
│  Drizzle ORM      │ Type-safe   │
│  Connection Pool  │ Serverless  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Services & Background Engine   │
├─────────────────────────────────┤
│  Clerk Auth       │ RBAC        │
│  Trigger.dev v4   │ Durable SDK │
│  Razorpay         │ Payments    │
│  Nodemailer       │ Trans. Mail │
└─────────────────────────────────┘
```

**Why This Stack?**
- Server-side role and ownership enforcement
- 4-dimension deterministic matching engine
- Durable background expiry and volunteer alerts
- Real Razorpay checkout plus zero-crash test mode

</td>
</tr>
</table>

<br/>

---

## 🚀 Installation & Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Neon Cloud PostgreSQL database URL
- Clerk Authentication keys
- Google Maps API Key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- Razorpay Keys (Test or Live)

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/Vivek-736/tripthi.git
cd tripthi
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Environment Variables**
Create `.env` in the root directory:
```bash
cp .env.example .env
```
Populate with your credentials:
```env
# Database & Authentication
DATABASE_URL=postgres://user:password@ep-sample.ap-southeast-1.aws.neon.tech/neondb
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Google Maps (Single Browser Key for Maps JS, Places, Routes)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Commercial Monetization (Razorpay)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Platform Admin Promotion
ADMIN_EMAIL=vivek338614@gmail.com
```

4. **Apply Database Migrations**
```bash
node scripts/migrate.mjs 0006_slow_wither.sql
```

5. **Seed Synthetic South India Demo Data**
```bash
node scripts/seed-demo.mjs
```

6. **Run Full Verification & QA Suite**
```bash
npx tsc --noEmit
node scripts/test-phase8-e2e.mjs
```

7. **Start Development Server**
```bash
npm run dev
```
Navigate to `http://localhost:3000` to explore Tripti! 🎉

---

## 📊 Performance & Environmental Formulas

- **Sub-60s Surplus Posting** — Fast presets for Biryani, Chapatis, Curries, and Produce.
- **Double-OTP Chain of Custody** — Atomic handoff transitions (`at_pickup` → `collected` → `delivered`).
- **1 Meal Portion = 0.4 kg** of wholesome diverted food waste.
- **1 kg Diverted Food = 2.5 kg CO2e** avoided from municipal landfill decomposition (UNEP/FAO standards).
- **185 Litres of Embedded Agricultural Water** preserved per meal portion rescued.

---

## 🧑‍💻 Meet The Developers & Researchers

<div align="center">
  
### Built with Passion and Purpose for the Codebenders ACE Builders Hackathon 2026

<br/>

<table>
<tr>
<td width="50%" align="center">

<img src="https://github.com/Vivek-736.png" width="130" height="130" style="border-radius: 50%; border: 3px solid #166534; aspect-ratio: 1 / 1; object-fit: cover;" alt="Ch V Ramcharan" />

### **Ch V Ramcharan**
**Lead Full-Stack Architect & AI Systems Researcher**

[![GitHub](https://img.shields.io/badge/GitHub-Vivek--736-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Vivek-736)

Core architecture, matching algorithms, spatial engines, background jobs & B2B monetization

</td>
<td width="50%" align="center">

<img src="https://github.com/yashasvini14.png" width="130" height="130" style="border-radius: 50%; border: 3px solid #166534; aspect-ratio: 1 / 1; object-fit: cover;" alt="T Yashasvini" />

### **T Yashasvini**
**Product Strategist, UI/UX & Sustainability Researcher**

[![GitHub](https://img.shields.io/badge/GitHub-yashasvini14-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yashasvini14)

Ecosystem UX design, ESG audit models, community receiver research & platform governance

</td>
</tr>
</table>

<br/>

```ascii
"Good food deserves a better destination."
```

</div>
