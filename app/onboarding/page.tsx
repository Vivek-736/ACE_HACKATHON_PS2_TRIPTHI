import { Suspense } from "react";
import { redirect } from "next/navigation";
import { dashboardPathFor, getCurrentUser } from "@/lib/auth/current-user";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Spinner } from "@/components/ui/spinner";

async function OnboardingContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Resumable: an onboarded user never sees the role form again.
  if (user.role !== "unassigned") {
    redirect(dashboardPathFor(user.role));
  }

  return <OnboardingForm />;
}

export default function OnboardingPage() {
  return (
    <main className="min-h-svh bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Step 1 of 1 &bull; Account Role Selection
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Choose how you will use Tripti
          </h1>
          <p className="text-sm text-muted-foreground">
            Select one role for this account. In the MVP, accounts are dedicated to a single active role.
          </p>
          <p className="text-xs text-muted-foreground">
            Demo profile: use an anonymised organisation or display name. Do not enter real personal details.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-12 text-sm text-muted-foreground shadow-xs">
              <Spinner className="size-6 text-primary" />
              <p>Checking account status&hellip;</p>
            </div>
          }
        >
          <OnboardingContent />
        </Suspense>
      </div>
    </main>
  );
}
