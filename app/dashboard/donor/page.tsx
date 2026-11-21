import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Clock,
  ExternalLink,
  Flame,
  Leaf,
  PlusCircle,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

async function DonorDashboardContent() {
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

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <span>Donor Overview</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {orgName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish surplus food in under 60 seconds and track community rescues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/donor#post-surplus"
            className={`${buttonVariants({ size: "default" })} gap-1.5`}
          >
            <PlusCircle className="size-4" />
            <span>Post Surplus Food</span>
            <span className="ml-1 rounded-sm bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
              &lt; 60s
            </span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Listings</span>
            <UtensilsCrossed className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">2 Active</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Available for nearby receivers
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Meals Rescued</span>
            <Flame className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">1,240</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Nutritious portions served
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Rescues Completed</span>
            <Clock className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">38 Runs</div>
            <p className="mt-1 text-xs text-muted-foreground">
              100% verified deliveries
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Emissions Avoided</span>
            <Leaf className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">520 kg CO₂e</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Landfill waste prevented
            </p>
          </div>
        </div>
      </div>

      {/* Active Rescue Listings & Order Lifecycle Preview */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">
            Active Surplus Listings
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Lifecycle: POSTED &rarr; CLAIMED &rarr; COLLECTED &rarr; DELIVERED
          </p>
        </div>

        <div className="divide-y divide-border">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Vegetable Biryani &amp; Dal Makhani
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary/30 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  CLAIMED
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quantity: 45 Portions &bull; Pickup Window: Today, 21:00 &ndash;
                22:30 &bull; Assigned to Hope Community Shelter
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                Volunteer in transit
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Steamed Rice &amp; Mixed Vegetable Curry
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  POSTED
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quantity: 60 Portions &bull; Storage: Hot Holding (65&deg;C)
                &bull; Allergens: Dairy (paneer)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                Matching nearby receivers
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          <span>
            * Demo data preview. Impact calculation assumes 0.42 kg food waste and
            0.84 kg CO₂e saved per meal portion.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DonorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading donor console&hellip;</p>
        </div>
      }
    >
      <DonorDashboardContent />
    </Suspense>
  );
}
