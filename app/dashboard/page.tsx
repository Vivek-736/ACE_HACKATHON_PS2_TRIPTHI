import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { Spinner } from "@/components/ui/spinner";

async function DashboardResolver() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // If role is not selected yet, redirect to onboarding immediately
  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  // Otherwise redirect to the specific role dashboard
  redirect(dashboardPathFor(user.role));
  return null;
}

export default function DashboardRootPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Directing to your console&hellip;</p>
        </div>
      }
    >
      <DashboardResolver />
    </Suspense>
  );
}