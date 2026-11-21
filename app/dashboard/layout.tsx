import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Spinner } from "@/components/ui/spinner";

const ROLE_BADGE_LABELS: Record<string, string> = {
  donor: "Food Donor",
  receiver: "Receiver Organisation",
  volunteer: "Rescue Volunteer",
  admin: "Platform Operator",
  unassigned: "Unassigned",
};

async function DashboardHeaderRole() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  const roleLabel = ROLE_BADGE_LABELS[user.role] ?? user.role;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/30 px-3 py-0.5 text-xs font-medium text-secondary-foreground">
      <span className="size-1.5 rounded-full bg-primary" />
      <span>{roleLabel}</span>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Console Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image src="/logo.svg" alt="Tripti" width={32} height={32} />
              <span className="text-lg">Tripti</span>
            </Link>

            <span className="hidden h-4 w-px bg-border sm:inline-block" />

            <Suspense
              fallback={
                <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-0.5 text-xs font-medium text-muted-foreground">
                  <span>Console</span>
                </div>
              }
            >
              <DashboardHeaderRole />
            </Suspense>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Public Site
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8 border border-border",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                <Spinner className="size-6 text-primary" />
                <p>Loading console workspace&hellip;</p>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
