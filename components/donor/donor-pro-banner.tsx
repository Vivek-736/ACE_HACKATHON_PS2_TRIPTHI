"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Crown,
  FileCheck2,
  LineChart,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import { SponsorshipCheckoutModal } from "@/components/payments/sponsorship-checkout-modal";
import { buttonVariants } from "@/components/ui/button";

interface DonorProBannerProps {
  isPro: boolean;
  planName?: string | null;
  subscriptionDate?: Date | null;
}

export function DonorProBanner({
  isPro,
  planName,
  subscriptionDate,
}: DonorProBannerProps) {
  if (isPro) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-linear-to-r from-emerald-500/10 via-primary/10 to-card p-6 shadow-xl shadow-emerald-500/5 transition-all">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <Crown className="size-3.5 text-emerald-600" />
              <span>TRIPTI PRO SUBSCRIBER &bull; ACTIVE</span>
            </div>

            <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Kitchen Overproduction Telemetry &amp; ESG Audit Suite Active
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Your kitchen is active on{" "}
              <strong className="text-foreground">{planName || "Pro Waste Analytics"}</strong>
              {subscriptionDate && (
                <span>
                  {" "}(activated on {new Date(subscriptionDate).toLocaleDateString()})
                </span>
              )}
              . Benefit from predictive day-of-week batch trimming, 2x priority courier dispatch, and audit-ready Scope 3 ESG certificates.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-card/80 border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                <Zap className="size-3 text-amber-500" />
                2x Priority Courier Dispatch: Active
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-card/80 border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                <TrendingDown className="size-3 text-emerald-500" />
                Prep Waste Savings: ~18% Averted
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-card/80 border border-border px-2.5 py-1 text-[11px] font-medium text-foreground">
                <FileCheck2 className="size-3 text-primary" />
                Audit Certificate: Ready for Download
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/donor/analytics"
              className={`${buttonVariants({ size: "default" })} gap-1.5 text-xs font-bold shadow-md hover:shadow-lg`}
            >
              <LineChart className="size-4" />
              <span>Open Pro Analytics Workspace</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>

            <SponsorshipCheckoutModal
              triggerButtonText="Manage Plan"
              defaultPlanId="donor_subscription_enterprise"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-linear-to-r from-amber-500/10 via-primary/10 to-card p-6 shadow-xl shadow-amber-500/5 transition-all">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 animate-pulse">
            <Sparkles className="size-3.5" />
            <span>TRIPTI PRO INTELLIGENCE &bull; UPGRADE AVAILABLE</span>
          </div>

          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Cut Kitchen Overproduction by ~18% &amp; Unlock Audit-Grade ESG Reports
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Rescue is always 100% free. Upgrade to <strong className="text-foreground">Tripti Pro</strong> for commercial kitchens to analyze day-of-week waste patterns, save an estimated ₹14,000/mo in procurement, and generate certified Scope 3 ESG audit certificates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-3.5 text-primary shrink-0" />
              <span>Day-of-week kitchen batch right-sizing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-3.5 text-primary shrink-0" />
              <span>Est. ₹12,000–₹18,000 monthly cost savings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-3.5 text-primary shrink-0" />
              <span>2x Priority Volunteer Courier dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-3.5 text-primary shrink-0" />
              <span>Official SEBI BRSR &amp; CSR audit certificate</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 shrink-0">
          <SponsorshipCheckoutModal
            triggerButtonText="Upgrade to Pro (₹499/mo)"
            defaultPlanId="donor_subscription_pro"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all gap-1.5"
          />

          <Link
            href="/dashboard/donor/analytics"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline px-3 py-1.5"
          >
            <LineChart className="size-3.5" />
            <span>Preview Pro Analytics Workspace &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}