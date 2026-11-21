import { Leaf, MapPin, Network, ShieldCheck, type LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: MapPin,
    title: "Smart Food Discovery",
    description:
      "Find available donations by location, quantity, food preferences and pickup deadlines.",
  },
  {
    icon: Network,
    title: "Intelligent Matching",
    description:
      "Connect each listing with a suitable receiver and an available volunteer, using distance, urgency, capacity and food compatibility.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Deliveries",
    description:
      "Pickup and delivery verification create a reliable record, so completed deliveries, not just requests, count toward impact.",
  },
  {
    icon: Leaf,
    title: "Impact Tracking",
    description:
      "Track completed rescues, delivered meal portions, food weight and volunteer contributions through transparent impact records.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-card border-y border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">FEATURES</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything needed to make every rescue count.
          </h2>
        </header>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-border bg-background p-6">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Capabilities shown here are the intended product experience, not live features.
        </p>
      </div>
    </section>
  );
}