"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Flame,
  Info,
  Leaf,
  RefreshCw,
  Scale,
  Sparkles,
  TrendingUp,
  Truck,
  Utensils,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { buttonVariants } from "@/components/ui/button";
import type { ImpactSummary } from "@/lib/impact/engine";

interface ImpactDashboardViewProps {
  scope?: "global" | "mine";
  title?: string;
  subtitle?: string;
}

export function ImpactDashboardView({
  scope = "global",
  title = "Environmental & Community Impact Dashboard",
  subtitle = "Quantifying food waste diverted from landfills and meals served to local shelters.",
}: ImpactDashboardViewProps) {
  const [data, setData] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchImpact = async () => {
    try {
      const res = await fetch(`/api/impact/summary?scope=${scope}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch impact data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, [scope]);

  const handleExportReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 text-xs text-muted-foreground">
        <Spinner className="size-6 text-primary" />
        <span>Aggregating verified rescue metrics &amp; emissions impact&hellip;</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground">
        Failed to load impact metrics. Please try refreshing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-primary uppercase">
            <Leaf className="size-3 sm:size-3.5" />
            <span>Verified Impact &amp; ESG Metrics</span>
          </div>
          <h2 className="mt-1 text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportReport}
            className={`${buttonVariants({ variant: "outline", size: "sm" })} gap-1.5 text-[11px] sm:text-xs py-1 sm:py-1.5 px-2.5 sm:px-3`}
          >
            <Download className="size-3 sm:size-3.5" />
            <span>Export ESG Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchImpact();
            }}
            disabled={refreshing}
            className="rounded-md border border-border bg-card p-1.5 sm:p-2 text-muted-foreground hover:bg-muted/30"
          >
            <RefreshCw className={`size-3 sm:size-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Primary Hero Impact Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Meals Saved */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Meals Rescued
            </span>
            <Utensils className="size-3.5 sm:size-4" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              {data.mealsRescued.toLocaleString()}+
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              Delivered safely to community shelters
            </p>
          </div>
        </div>

        {/* 2. Food Waste Avoided */}
        <div className="rounded-2xl border border-secondary/40 bg-secondary/15 p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-secondary-foreground">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Food Waste Diverted
            </span>
            <Scale className="size-3.5 sm:size-4" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              {data.foodWasteDivertedKg.toLocaleString()} kg
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              Diverted from methane-producing landfills
            </p>
          </div>
        </div>

        {/* 3. CO2e Avoided */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              GHG Emissions Avoided
            </span>
            <Leaf className="size-3.5 sm:size-4" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              {data.emissionsAvoidedKgCo2e.toLocaleString()} kg CO₂e
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              Scope 3 avoided landfill emissions
            </p>
          </div>
        </div>

        {/* 4. Verified Rescue Missions */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-accent-foreground">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Completed Missions
            </span>
            <Truck className="size-3.5 sm:size-4" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              {data.completedMissions} Rescues
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
              100% physically handshaked via dual OTP
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Audit Assumptions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Food Category Composition */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <span>Rescued Food Category Breakdown</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Portions and mass diverted across food categories
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">
              100% Edible Surplus
            </span>
          </div>

          <div className="space-y-3.5">
            {data.categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">
                    {item.portions} portions ({item.weightKg} kg) &bull;{" "}
                    <strong>{item.percentage}%</strong>
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Transparent Assumptions & ESG Standards */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-primary/20 pb-3">
            <Info className="size-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold text-foreground">
              Calculation Assumptions
            </h3>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <div className="rounded-lg bg-card/70 p-3 border border-border/60">
              <span className="font-semibold text-foreground block mb-0.5">
                Standard Portion Weight:
              </span>
              <span>
                1 standardized cooked meal portion ={" "}
                <strong>{data.assumptions.portionWeightKg} kg</strong> (400 grams).
              </span>
            </div>

            <div className="rounded-lg bg-card/70 p-3 border border-border/60">
              <span className="font-semibold text-foreground block mb-0.5">
                Emissions Factor:
              </span>
              <span>
                1 kg diverted food waste ={" "}
                <strong>{data.assumptions.emissionFactorKgCo2ePerKgWaste} kg CO₂e</strong>{" "}
                prevented from anaerobic landfill decomposition.
              </span>
            </div>

            <div className="rounded-lg bg-card/70 p-3 border border-border/60">
              <span className="font-semibold text-foreground block mb-0.5">
                Verification Standard:
              </span>
              <span>
                {data.assumptions.policyStatement}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Verified Deliveries Log */}
      <div className="rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Recent Verified Delivery Missions</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Audit log of completed handoffs feeding live impact statistics
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {data.recentDeliveries.length} Logged
          </span>
        </div>

        <div className="divide-y divide-border">
          {data.recentDeliveries.map((del) => (
            <div
              key={del.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between text-xs hover:bg-muted/10 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{del.listingTitle}</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    +{del.portions} Meals
                  </span>
                </div>
                <div className="text-muted-foreground">
                  From <strong>{del.donorName}</strong> &rarr; Delivered to{" "}
                  <strong>{del.receiverName}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground self-start sm:self-auto">
                <span className="font-medium text-foreground">
                  {del.weightKg} kg ({del.co2eKg} kg CO₂e)
                </span>
                <span className="text-[11px]">
                  {new Date(del.deliveredAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
