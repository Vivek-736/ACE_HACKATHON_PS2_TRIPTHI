import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { Spinner } from "@/components/ui/spinner";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
          <Spinner className="size-8 text-primary" />
          <p>Loading registration&hellip;</p>
        </div>
      }
    >
      <SignUp
        fallbackRedirectUrl="/onboarding"
        signInFallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "w-full border border-border bg-card rounded-2xl p-6 sm:p-8 shadow-xs",
            headerTitle: "text-foreground font-bold text-2xl tracking-tight",
            headerSubtitle: "text-muted-foreground text-sm",
            socialButtonsBlockButton:
              "border border-border hover:bg-muted text-foreground rounded-lg transition-colors text-sm font-medium",
            dividerLine: "bg-border",
            dividerText: "text-xs uppercase text-muted-foreground bg-card px-2",
            formFieldLabel: "text-foreground text-xs font-semibold",
            formFieldInput:
              "rounded-lg border border-border bg-background text-foreground text-sm focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-semibold shadow-xs transition-all active:translate-y-px h-10",
            footerActionText: "text-muted-foreground text-xs",
            footerActionLink: "text-primary hover:underline text-xs font-semibold",
          },
        }}
      />
    </Suspense>
  );
}
