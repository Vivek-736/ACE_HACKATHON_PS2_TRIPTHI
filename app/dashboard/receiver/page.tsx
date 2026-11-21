import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Search,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

async function ReceiverDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "receiver" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const orgName =
    user.organisationName || user.displayName || "Receiver Organisation";

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>Receiver Community Console</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {orgName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover matched food donations and coordinate incoming volunteer
            deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/receiver#discover"
            className={`${buttonVariants({ size: "default" })} gap-1.5`}
          >
            <Search className="size-4" />
            <span>Discover Available Food</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Meals Received</span>
            <HeartHandshake className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">850 Portions</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total received to date
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Incoming Deliveries</span>
            <Truck className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">1 En Route</div>
            <p className="mt-1 text-xs text-muted-foreground">
              ETA: ~18 mins (Volunteer verified)
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Community Beneficiaries</span>
            <Users className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">340 People</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Nourished this month
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Verification Status</span>
            <CheckCircle2 className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">Active Partner</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Verified NGO / Shelter
            </p>
          </div>
        </div>
      </div>

      {/* Incoming Rescue Delivery & OTP Handshake Preview */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">
            Incoming Delivery &amp; Handshake
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Verified handoff requires confirmation upon arrival.
          </p>
        </div>

        <div className="p-5">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    Vegetable Biryani &amp; Dal Makhani (45 Portions)
                  </span>
                  <span className="rounded-full bg-secondary/30 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    COLLECTED &bull; EN ROUTE
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  From: Royal Feast Banquet Hall &bull; Volunteer: Ravi K.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Handoff OTP</span>
                  <div className="font-mono text-base font-bold text-foreground">
                    8492
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          <span>
            * Receivers receive rescued food at zero cost. Safe handling instructions
            and allergens are documented on every listing.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReceiverDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading receiver console&hellip;</p>
        </div>
      }
    >
      <ReceiverDashboardContent />
    </Suspense>
  );
}
