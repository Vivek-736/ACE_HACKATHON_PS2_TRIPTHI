import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function CallToAction() {
  return (
    <section id="get-involved" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
          Be part of something that puts good food to good use.
        </h2>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up?role=donor"
            className={`${buttonVariants({ size: "lg" })} ${focusRing}`}
          >
            Become a Donor
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/sign-up?role=volunteer"
            className={`${buttonVariants({ variant: "outline", size: "lg" })} ${focusRing}`}
          >
            Join as a Volunteer
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Organisations can join as receivers from the sign-up page.
        </p>
      </div>
    </section>
  );
}