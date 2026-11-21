import { Package, Truck, Utensils, type LucideIcon } from "lucide-react";

type Metric = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const metrics: Metric[] = [
  { label: "Meals Delivered", value: "1,240", icon: Utensils },
  { label: "Food Rescued", value: "3.6 t", icon: Package },
  { label: "Completed Deliveries", value: "326", icon: Truck },
];

export default function ImpactSection() {
  return (
    <section id="impact" className="bg-primary text-primary-foreground py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">IMPACT</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Small rescues. Meaningful change.
        </h2>
        <p className="mt-4 max-w-2xl text-lg opacity-90">
          Every successful delivery represents food put to better use, a community supported, and a
          volunteer who helped make it happen.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-primary-foreground/20 p-6">
              <div className="flex items-center gap-3">
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                <h3 className="text-base font-semibold">{label}</h3>
              </div>
              <p className="mt-6 text-5xl font-bold tabular-nums">{value}</p>
              <p className="mt-2 text-sm opacity-80">Demo figure · not live data</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm opacity-80">
          Only verified deliveries contribute to completed-rescue impact.
        </p>
      </div>
    </section>
  );
}