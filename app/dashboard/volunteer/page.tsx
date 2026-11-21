import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { Spinner } from "@/components/ui/spinner";

async function VolunteerDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "volunteer" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const volunteerName = user.displayName || user.firstName || "Volunteer Courier";

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>Rescue Volunteer Console</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {volunteerName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick up surplus food and deliver it to nearby shelters before expiry.
          </p>
        </div>

        {/* Availability Status Badge */}
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Online &bull; Ready for Rescues
          </span>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Completed Rescues</span>
            <CheckCircle className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">24 Missions</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivered safely on time
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Rescue Credits</span>
            <Award className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">360 Credits</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Non-cash community recognition
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Distance Traveled</span>
            <Navigation className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">86.4 km</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total rescue transit
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Reliability Score</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">98.5%</div>
            <p className="mt-1 text-xs text-muted-foreground">
              On-time verification rate
            </p>
          </div>
        </div>
      </div>

      {/* Available Rescues Queue Preview */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">
            Available Rescue Opportunities Nearby
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by distance, expiration urgency, and receiver capacity.
          </p>
        </div>

        <div className="divide-y divide-border">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  Spice Kitchen Canteen &rarr; Care Foundation Shelter
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                  Urgent &bull; 45m left
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                30 Meals &bull; Pickup: Banjara Hills (1.8 km) &bull; Drop: Jubilee
                Hills (3.2 km)
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Accept Rescue Assignment
            </button>
          </div>
        </div>

        <div className="border-t border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          <span>
            * Rescue Credits are non-cash recognition points. Compensation is funded
            by donors and CSR sponsors, never deducted from volunteers.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VolunteerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading volunteer console&hellip;</p>
        </div>
      }
    >
      <VolunteerDashboardContent />
    </Suspense>
  );
}
