import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Brand Showcase Panel (Visible on lg and wider) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex xl:p-16">
        {/* Subtle Architectural Grid Pattern */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12)_0%,transparent_60%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 -z-10 size-96 rounded-full bg-primary-foreground/5 blur-3xl"
          aria-hidden="true"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg text-lg font-bold tracking-tight text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
          >
            <Image
              src="/logo.svg"
              alt="Tripti"
              width={34}
              height={34}
              className="rounded-lg bg-primary-foreground/10 p-1"
            />
            <span>Tripti</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Central Narrative & Pillars */}
        <div className="my-auto max-w-lg space-y-8 py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              <Leaf className="size-3.5" />
              <span>Rescue the Surplus</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl xl:text-5xl xl:leading-[1.15]">
              Good food deserves a better destination.
            </h1>

            <p className="text-base leading-relaxed text-primary-foreground/85">
              Tripti bridges food businesses with local NGOs and volunteers.
              Every rescue connects willing community couriers to deliver meals
              before they expire.
            </p>
          </div>

          {/* Three-Sided Platform Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-3.5 backdrop-blur-xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
                <UtensilsCrossed className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-primary-foreground">
                  Donors &bull; Publish Surplus &lt; 60s
                </div>
                <p className="text-xs text-primary-foreground/75">
                  Restaurants, caterers, and hostel messes prevent edible waste
                  with allergen &amp; storage clarity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-3.5 backdrop-blur-xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
                <HeartHandshake className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-primary-foreground">
                  Receivers &bull; Zero-Cost Nutritious Meals
                </div>
                <p className="text-xs text-primary-foreground/75">
                  Shelters and community kitchens discover available food matched
                  to their capacity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-3.5 backdrop-blur-xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground">
                <Truck className="size-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-primary-foreground">
                  Volunteers &bull; Verified Transport
                </div>
                <p className="text-xs text-primary-foreground/75">
                  Neighborhood collections confirmed via secure OTP handoffs and
                  community Rescue Credits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee / Trust Line */}
        <div className="space-y-2 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/70">
          <div className="flex items-center gap-2 font-medium text-primary-foreground/90">
            <ShieldCheck className="size-4" />
            <span>Less waste. More meals. Stronger communities.</span>
          </div>
          <p className="text-[11px] text-primary-foreground/60">
            Hackathon prototype &bull; Anonymised demo data used in compliance with
            privacy guidelines.
          </p>
        </div>
      </div>

      {/* Right Content Panel (Auth Form) */}
      <div className="flex min-h-screen w-full flex-col justify-between bg-background px-4 py-8 sm:px-8 lg:w-1/2 lg:p-12 xl:p-16">
        {/* Top Header for Mobile */}
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <Image src="/logo.svg" alt="Tripti" width={32} height={32} />
            <span className="text-base">Tripti</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Centered Auth Card Container */}
        <div className="my-auto flex w-full flex-col items-center justify-center py-6">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Bottom Context Notice */}
        <div className="pt-6 text-center text-xs text-muted-foreground">
          <span>
            By signing in, you agree to Tripti&apos;s food safety handling guidelines
            and community terms.
          </span>
        </div>
      </div>
    </div>
  );
}