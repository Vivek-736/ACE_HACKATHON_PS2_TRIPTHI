import Link from "next/link";
import { ArrowRight, Leaf, Workflow } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function HeroSection() {
  return (
    <section
      id="top"
      className="bg-background px-4 pt-20 pb-12 text-center sm:px-6 sm:-mt-2 lg:px-8"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <span
          className="Tripti-rise inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          <Leaf className="size-3.5" aria-hidden="true" />
          FOOD RESCUE, REIMAGINED
        </span>

        <h1
          className="Tripti-rise mt-6 text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          <span className="block">Good food deserves</span>
          <span className="block text-primary">a better destination.</span>
        </h1>

        <p
          className="Tripti-rise mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Connect surplus food with the communities that need it. Tripti brings donors,
          organisations and volunteers together to make every rescue count.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/sign-up"
            className={`${buttonVariants({ size: "lg" })} ${FOCUS_RING}`}
          >
            Start Rescuing
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="#how-it-works"
            className={`${buttonVariants({ variant: "outline", size: "lg" })} ${FOCUS_RING}`}
          >
            <Workflow className="size-4" aria-hidden="true" />
            Explore How It Works
          </Link>
        </div>
      </div>
    </section>
  );
}