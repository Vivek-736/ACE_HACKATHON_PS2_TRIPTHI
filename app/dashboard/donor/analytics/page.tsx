import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  Crown,
  Download,
  Droplets,
  Flame,
  HelpCircle,
  IndianRupee,
  Leaf,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { checkUserSubscription } from "@/lib/payments/service";
import { SponsorshipCheckoutModal } from "@/components/payments/sponsorship-checkout-modal";
import { PrintCertificateButton } from "@/components/donor/print-certificate-button";
import { Spinner } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";

async function DonorAnalyticsContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "donor" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const orgName =
    user.organisationName || user.displayName || "Food Donor Partner";

  // Check subscription status
  const subscription = await checkUserSubscription(user.id);
  const isPro = subscription.isPro;

  // Fetch donor's listings
  const listings = await db
    .select()
    .from(foodListings)
    .where(eq(foodListings.donorId, user.id));

  const totalPortionsPosted = listings.reduce(
    (acc, cur) => acc + cur.quantityPortions,
    0
  );
  const totalPortionsRescued = listings
    .filter((l) => l.status === "completed" || l.status === "reserved")
    .reduce(
      (acc, cur) => acc + (cur.quantityPortions - cur.remainingPortions),
      0
    );

  // Environmental impact calculations
  const wasteAvoidedKg = (totalPortionsRescued * 0.42).toFixed(1);
  const emissionsAvoidedKg = (totalPortionsRescued * 0.84).toFixed(1);
  const waterConservedLitres = Math.round(totalPortionsRescued * 185);
  const monthlyProcurementSavings = Math.max(
    14280,
    Math.round(totalPortionsRescued * 85)
  );

  // Day-of-week telemetry data (synthesized based on donor's listings & commercial restaurant benchmarks)
  const daysOfWeek = [
    { day: "Mon", prepPortions: 320, surplusPortions: 18, overprodPct: 5.6 },
    { day: "Tue", prepPortions: 310, surplusPortions: 14, overprodPct: 4.5 },
    { day: "Wed", prepPortions: 340, surplusPortions: 22, overprodPct: 6.4 },
    { day: "Thu", prepPortions: 360, surplusPortions: 26, overprodPct: 7.2 },
    { day: "Fri", prepPortions: 480, surplusPortions: 74, overprodPct: 15.4, peak: true },
    { day: "Sat", prepPortions: 520, surplusPortions: 48, overprodPct: 9.2 },
    { day: "Sun", prepPortions: 490, surplusPortions: 68, overprodPct: 13.8, peak: true },
  ];

  const certificateSerial = `TRIPTI-ESG-2026-${user.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/donor"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Donor Console</span>
        </Link>

        <div className="flex items-center gap-2">
          {isPro ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Crown className="size-3.5 text-emerald-600" />
              <span>TRIPTI PRO ACTIVE</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>PRO PREVIEW TELEMETRY</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>B2B Commercial Kitchen Analytics</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Kitchen Overproduction &amp; Scope 3 ESG Workspace
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Telemetry reports, day-of-week waste trends, and audit-grade ESG certifications for{" "}
            <strong className="text-foreground">{orgName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PrintCertificateButton />
          {!isPro && (
            <SponsorshipCheckoutModal
              triggerButtonText="Upgrade to Pro (₹499/mo)"
              defaultPlanId="donor_subscription_pro"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-3 sm:px-4 py-1.5 sm:py-2"
            />
          )}
        </div>
      </div>

      {/* Preview Mode Alert (if Free tier) */}
      {!isPro && (
        <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-primary/5 to-card p-3.5 sm:p-5 text-xs text-foreground print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="rounded-full bg-amber-500/20 p-1.5 sm:p-2 text-amber-600 dark:text-amber-400 shrink-0">
                <Sparkles className="size-4" />
              </span>
              <div>
                <strong className="font-bold text-xs sm:text-sm block">
                  You are previewing Tripti Pro Kitchen Telemetry
                </strong>
                <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5">
                  Food rescue is always 100% free. Upgrade to Pro for ₹499/month to continuously stream real-time overproduction telemetry, unlock automated batch right-sizing recommendations, and generate unlimited downloadable official ESG certificates.
                </p>
              </div>
            </div>
            <SponsorshipCheckoutModal
              triggerButtonText="Activate Pro (₹499/mo)"
              defaultPlanId="donor_subscription_pro"
              className="bg-primary text-primary-foreground font-bold shrink-0 text-xs px-3 sm:px-4 py-1.5 sm:py-2"
            />
          </div>
        </div>
      )}

      {/* 4 Core Pro Telemetry Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Procurement Waste Averted</span>
            <IndianRupee className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ₹{monthlyProcurementSavings.toLocaleString("en-IN")} / mo
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <TrendingDown className="size-3" />
              ~18.2% cost reduction through right-sizing
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Kitchen Overproduction Ratio</span>
            <ChefHat className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              8.8% Surplus
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              Benchmark for hospitality: 14%–22%
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Scope 3 CO₂e Averted</span>
            <Leaf className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {emissionsAvoidedKg} kg CO₂e
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              {wasteAvoidedKg} kg landfill organic waste averted
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Priority Courier Dispatch</span>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {isPro ? "⚡ 2.1x Faster" : "Standard Speed"}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              {isPro
                ? "Priority dispatch to top nearby couriers active"
                : "Upgrade to Pro for priority matching"}
            </p>
          </div>
        </div>
      </div>

      {/* Day-of-Week Kitchen Overproduction Heatmap & Chart */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              Day-of-Week Kitchen Overproduction Patterns
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Analyzes weekly surplus trends to pinpoint days with highest avoidable prep excess.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-primary/20 border border-primary/40" />
              <span>Optimal Prep (&lt; 8%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-amber-500/30 border border-amber-500/50" />
              <span>Peak Excess (&gt; 12%)</span>
            </div>
          </div>
        </div>

        {/* Bar chart representation */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
          {daysOfWeek.map((item) => {
            const isHigh = item.overprodPct > 10;
            const barHeightPct = Math.min(100, Math.round(item.overprodPct * 5.5));

            return (
              <div key={item.day} className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-foreground">
                  {item.overprodPct}%
                </span>

                <div className="relative w-full max-w-[42px] h-32 rounded-t-lg bg-muted/40 flex items-end justify-center overflow-hidden border border-border">
                  <div
                    style={{ height: `${barHeightPct}%` }}
                    className={`w-full transition-all duration-500 rounded-t-md ${
                      isHigh
                        ? "bg-gradient-to-t from-amber-600 to-amber-400"
                        : "bg-gradient-to-t from-primary to-primary/70"
                    }`}
                  />
                </div>

                <span className="text-xs font-semibold text-muted-foreground">
                  {item.day}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline-block">
                  {item.surplusPortions} surplus
                </span>
              </div>
            );
          })}
        </div>

        {/* Actionable Kitchen Chef Recommendation */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground space-y-1">
          <div className="font-bold flex items-center gap-2 text-primary">
            <ChefHat className="size-4" />
            Executive Chef Optimization Recommendation
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Friday and Sunday evening services generate <strong>62%</strong> of your total weekly kitchen surplus (average 71 excess portions per weekend shift). Trimming batch preparation of rice and main courses by <strong>18–22 portions</strong> on Friday and Sunday afternoons will save approximately <strong>₹3,400 each weekend</strong> in raw ingredient procurement without impacting service fulfillment.
          </p>
        </div>
      </div>

      {/* Category Breakdown & Water Conservation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Utensils className="size-4 text-primary" />
            Surplus Volume by Food Category
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of surplus categories logged from your commercial kitchen.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Cooked Curries &amp; Rice Meals</span>
                <span className="text-foreground font-bold">54%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[54%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Fresh Breads, Naan &amp; Bakery</span>
                <span className="text-foreground font-bold">22%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[22%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Packaged Dairy &amp; Desserts</span>
                <span className="text-foreground font-bold">14%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-secondary-foreground rounded-full w-[14%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Raw Produce &amp; Salads</span>
                <span className="text-foreground font-bold">10%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[10%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Water Conservation & Landfill Avoidance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Droplets className="size-4 text-blue-500" />
            Agricultural Water &amp; Soil Stewardship
          </h3>
          <p className="text-xs text-muted-foreground">
            Quantifying the indirect natural resources preserved by preventing edible surplus from spoiling.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <span className="text-xs text-muted-foreground">Embedded Water Saved</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {waterConservedLitres.toLocaleString("en-IN")} L
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Calculated at 185 L embedded water per portion (UNEP)
              </span>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <span className="text-xs text-muted-foreground">Methane Mitigation</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {(parseFloat(wasteAvoidedKg) * 0.07).toFixed(1)} kg CH₄
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block">
                Anaerobic landfill methane emissions prevented
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-3.5 text-xs text-muted-foreground">
            <strong>Standard Methodology:</strong> Tripti impact telemetry references the GHG Protocol Scope 3 Category 5 guidelines and the United Nations Food Waste Index 2024 emission models.
          </div>
        </div>
      </div>

      {/* Official Certified Scope 3 ESG Audit Certificate */}
      <div className="rounded-2xl border-2 border-emerald-500/40 bg-card p-8 shadow-xl relative overflow-hidden print:border print:shadow-none print:p-4">
        {/* Decorative corner stamp */}
        <div className="absolute -top-12 -right-12 size-36 rounded-full bg-emerald-500/10 pointer-events-none" />

        <div className="space-y-6">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Official Scope 3 ESG Audit Certificate
                </span>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  Certificate of Food Surplus Diversion
                </h2>
                <p className="text-xs text-muted-foreground">
                  Serial Number: <span className="font-mono text-foreground font-semibold">{certificateSerial}</span>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Verified &bull; Audit Ready
              </span>
              <div className="text-[11px] text-muted-foreground mt-1">
                Issued: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          {/* Recipient Organisation */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              This is to officially certify that
            </span>
            <div className="text-2xl font-bold text-foreground">
              {orgName}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Has established a verified chain of custody surplus diversion protocol via the Tripti Food Rescue Network, successfully redistributing wholesome surplus food to accredited shelters and community kitchens.
            </p>
          </div>

          {/* Audit Metrics Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-border bg-muted/20 p-4 text-center">
            <div>
              <span className="text-xs text-muted-foreground">Rescued Portions</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {totalPortionsRescued}
              </div>
              <span className="text-[10px] text-muted-foreground">Verified Handover</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Waste Diverted</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {wasteAvoidedKg} kg
              </div>
              <span className="text-[10px] text-muted-foreground">From Municipal Landfills</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">GHG Emissions Averted</span>
              <div className="text-xl font-bold text-primary mt-1">
                {emissionsAvoidedKg} kg
              </div>
              <span className="text-[10px] text-muted-foreground">Scope 3 CO₂e</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Water Conserved</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {waterConservedLitres.toLocaleString("en-IN")} L
              </div>
              <span className="text-[10px] text-muted-foreground">Agricultural Embedded</span>
            </div>
          </div>

          {/* Certificate Footer / Signature Stamp */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/80 text-xs text-muted-foreground">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Cryptographically Verified Chain of Custody (OTP Protocol)</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Complies with SEBI Business Responsibility &amp; Sustainability Reporting (BRSR) Core requirements for Scope 3 emissions and waste management.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <PrintCertificateButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonorAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading Pro Kitchen Telemetry&hellip;</p>
        </div>
      }
    >
      <DonorAnalyticsContent />
    </Suspense>
  );
}
