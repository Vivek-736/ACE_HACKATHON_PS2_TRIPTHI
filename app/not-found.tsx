import Image from "next/image";
import Link from "next/link";
import { 
  Compass, 
  HeartHandshake, 
  Home, 
  MapPinOff, 
  Truck, 
  Utensils 
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main
        id="main"
        className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-2xl flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground">
            <MapPinOff aria-hidden="true" className="size-3.5 text-accent-foreground" />
            <span>404 &bull; Page Not Found</span>
          </div>

          {/* Visual Accent */}
          <div className="relative mt-8 flex size-24 items-center justify-center rounded-2xl border border-border bg-card shadow-xs">
            <div
              className="absolute -inset-1 rounded-2xl bg-primary/10 blur-md"
              aria-hidden="true"
            />
            <Image
              src="/logo.svg"
              alt="Tripti Logo"
              width={56}
              height={56}
              className="relative"
              priority
            />
          </div>

          {/* Headline & Narrative */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            Good food deserves a destination. This link doesn&apos;t have one.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground text-balance">
            The page or donation listing you were searching for might have expired,
            been rescued, or moved to a different location. Let&apos;s get you back to
            connecting surplus food with communities in need.
          </p>

          {/* Primary Navigation Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className={`${buttonVariants({ size: "lg" })} ${FOCUS_RING} gap-2 font-medium`}
            >
              <Home aria-hidden="true" className="size-4" />
              Return to Home
            </Link>
            <Link
              href="/#how-it-works"
              className={`${buttonVariants({ variant: "outline", size: "lg" })} ${FOCUS_RING} gap-2`}
            >
              <Compass aria-hidden="true" className="size-4" />
              How Tripti Works
            </Link>
          </div>

          {/* Three-Sided Role Shortcuts */}
          <div className="mt-14 w-full border-t border-border pt-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explore Tripti by role
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              <Link
                href="/sign-up?role=donor"
                className={`group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40 ${FOCUS_RING}`}
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Utensils aria-hidden="true" className="size-4" />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  Donors
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Publish surplus food and prevent edible waste in under 60 seconds.
                </p>
              </Link>

              <Link
                href="/sign-up?role=volunteer"
                className={`group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40 ${FOCUS_RING}`}
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Truck aria-hidden="true" className="size-4" />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  Rescue Volunteers
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Collect and transport meals to nearby shelters and community kitchens.
                </p>
              </Link>

              <Link
                href="/sign-up?role=receiver"
                className={`group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40 ${FOCUS_RING}`}
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                  <HeartHandshake aria-hidden="true" className="size-4" />
                </div>
                <h2 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  Receivers &amp; NGOs
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Discover nutritious food donations matched to your capacity.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}