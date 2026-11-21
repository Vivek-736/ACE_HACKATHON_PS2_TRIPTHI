import { HeartHandshake, Store, Truck, type LucideIcon } from "lucide-react";

type Step = {
  number: string;
  role: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "1",
    role: "Donors",
    icon: Store,
    title: "Share surplus food.",
    description:
      "Restaurants, caterers, hostels and food businesses publish surplus food with its quantity, preparation time, storage details and pickup deadline.",
  },
  {
    number: "2",
    role: "Receivers",
    icon: HeartHandshake,
    title: "Discover suitable donations.",
    description:
      "NGOs, shelters and community kitchens find food that fits their needs, capacity, dietary preferences and location.",
  },
  {
    number: "3",
    role: "Volunteers",
    icon: Truck,
    title: "Collect and deliver food.",
    description:
      "Volunteers accept rescue tasks, collect the food and deliver it to the assigned organisation, with verified pickup and delivery.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            HOW IT WORKS
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From surplus to someone who needs it.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every rescue follows a simple, coordinated journey.
          </p>
        </header>

        <ol className="mt-16 flex flex-col md:grid md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            return (
              <li
                key={step.number}
                className="relative border-l border-border pb-10 pl-10 last:pb-0 md:border-l-0 md:pb-0 md:pl-0"
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="hidden md:absolute md:left-16 md:right-0 md:top-8 md:block md:h-px md:bg-border"
                  />
                )}

                <span
                  aria-hidden="true"
                  className="absolute -left-8 top-0 flex size-16 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-secondary-foreground md:static"
                >
                  {step.number}
                </span>

                <div className="flex items-center gap-2 pt-1 text-primary md:mt-6 md:pt-0">
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    {step.role}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}