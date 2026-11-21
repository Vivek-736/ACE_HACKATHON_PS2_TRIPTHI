import { Spinner } from "@/components/ui/spinner";

export default function OnboardingLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p>Loading onboarding&hellip;</p>
      </div>
    </div>
  );
}
