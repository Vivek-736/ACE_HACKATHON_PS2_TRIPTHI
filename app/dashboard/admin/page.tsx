import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  Activity,
  CreditCard,
  Database,
  FileCheck,
  Shield,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { rescueOrders } from "@/db/schema/orders";
import { paymentRecords } from "@/db/schema/payments";
import { foodListings } from "@/db/schema/listings";
import { Spinner } from "@/components/ui/spinner";
import { AdminVerificationTable } from "@/components/admin/admin-verification-table";
import { ImpactDashboardView } from "@/components/impact/impact-dashboard-view";
import { SponsorshipCheckoutModal } from "@/components/payments/sponsorship-checkout-modal";

async function AdminDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch live stats directly in Server Component
  const allUsers = await db.select().from(users);
  const allOrders = await db.select().from(rescueOrders);
  const allPayments = await db.select().from(paymentRecords);

  const pendingVerifications = allUsers.filter(
    (u) =>
      (u.role === "donor" || u.role === "receiver") &&
      u.verificationStatus !== "verified"
  ).length;

  const activeRescues = allOrders.filter((o) =>
    ["pending", "accepted", "at_pickup", "collected", "at_receiver"].includes(
      o.status
    )
  ).length;

  const totalRevenuePaise = allPayments
    .filter((p) => p.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary">
            <Shield className="size-3 sm:size-3.5" />
            <span>Internal Platform Admin Console</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Operations &amp; Governance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Supervise organisation verifications, rescue listings, dispute
            resolution, and aggregate impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SponsorshipCheckoutModal triggerButtonText="Record CSR Sponsorship" />
        </div>
      </div>

      {/* Aggregate Platform Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Total Registered Users</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {allUsers.length} Users
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              Donors, receivers &amp; volunteers
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Pending Verifications</span>
            <FileCheck className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {pendingVerifications} Pending
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              Awaiting credentials review
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Active Rescues Today</span>
            <Activity className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {activeRescues} In-Flight
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">Across South cluster</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">CSR &amp; Logistics Fund</span>
            <CreditCard className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              ₹{(totalRevenuePaise / 100).toLocaleString()}
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">
              {allPayments.length} transactions recorded
            </p>
          </div>
        </div>
      </div>

      {/* Organisation Verification Desk */}
      <AdminVerificationTable />

      {/* Global Environmental Impact Engine */}
      <ImpactDashboardView
        scope="global"
        title="Platform-Wide Environmental & Community Impact"
        subtitle="Auditable metrics compiled exclusively from physically verified delivery handshakes."
      />
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
