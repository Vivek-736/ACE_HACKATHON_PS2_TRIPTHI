import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  FileCheck,
  Shield,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Spinner } from "@/components/ui/spinner";

async function AdminDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <Shield className="size-3.5" />
          <span>Internal Platform Admin Console</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Operations &amp; Governance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Supervise organisation verifications, rescue listings, dispute
          resolution, and aggregate impact.
        </p>
      </div>

      {/* Aggregate Platform Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Registered Users</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">128</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Donors, receivers &amp; volunteers
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Pending Verifications</span>
            <FileCheck className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">4 NGOs</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting credentials review
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Rescues Today</span>
            <Activity className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">14 Missions</div>
            <p className="mt-1 text-xs text-muted-foreground">Across demo cluster</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Database Health</span>
            <Database className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">Healthy</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Neon PostgreSQL connected
            </p>
          </div>
        </div>
      </div>

      {/* Verification Queue Preview */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">
            Organisation Verification Queue
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Verify legitimate restaurants, caterers, and receiver NGOs before
            publishing live donations.
          </p>
        </div>

        <div className="divide-y divide-border">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="font-semibold text-foreground">
                Grace Community Food Bank
              </span>
              <p className="text-xs text-muted-foreground">
                Receiver Organisation &bull; Reg: NGO-2026-HYD-84 &bull; Capacity: 150
                portions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Review Docs
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Approve
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/20 p-4 text-xs text-muted-foreground">
          <span>
            * Platform Admin actions are logged with immutable audit timestamps.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading admin console&hellip;</p>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
