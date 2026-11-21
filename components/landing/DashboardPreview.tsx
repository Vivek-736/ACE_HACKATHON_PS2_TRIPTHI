import {
  Activity,
  Building2,
  Circle,
  CheckCircle2,
  Clock,
  Handshake,
  Leaf,
  LayoutList,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  UtensilsCrossed,
  ChartColumn,
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: Leaf, active: true },
  { label: "Food Listings", icon: LayoutList, active: false },
  { label: "Discover", icon: Search, active: false },
  { label: "Deliveries", icon: Truck, active: false },
  { label: "Impact", icon: ChartColumn, active: false },
];

const metrics = [
  {
    label: "Available Meals",
    value: "1,240",
    sublabel: "+12% this week",
    icon: UtensilsCrossed,
  },
  {
    label: "Active Rescues",
    value: "18",
    sublabel: "6 need volunteers",
    icon: Activity,
  },
  {
    label: "Completed Deliveries",
    value: "326",
    sublabel: "verified",
    icon: Truck,
  },
  {
    label: "Volunteers",
    value: "74",
    sublabel: "12 online now",
    icon: Users,
  },
];

const listings = [
  {
    name: "Vegetable biryani",
    donor: "Saffron Kitchen",
    portions: "40",
    pickup: "19:30",
    status: "Available",
  },
  {
    name: "Bread and dal",
    donor: "City Caterers",
    portions: "25",
    pickup: "21:00",
    status: "Claimed",
  },
  {
    name: "Fresh fruit boxes",
    donor: "Green Hostel Mess",
    portions: "12",
    pickup: "17:45",
    status: "Collected",
  },
  {
    name: "Rice and sabzi",
    donor: "Lakeview Canteen",
    portions: "60",
    pickup: "16:00",
    status: "Delivered",
  },
];

const statusStyles = {
  Available: {
    icon: Package,
    className: "text-primary bg-secondary",
  },
  Claimed: {
    icon: Clock,
    className: "text-accent-foreground bg-accent",
  },
  Collected: {
    icon: Truck,
    className: "text-foreground bg-muted",
  },
  Delivered: {
    icon: CheckCircle2,
    className: "text-primary bg-background border border-border",
  },
} as const;

const timeline = [
  {
    time: "18:05",
    title: "Pickup confirmed",
    detail: "Saffron Kitchen",
    icon: Handshake,
  },
  {
    time: "18:20",
    title: "Volunteer assigned",
    detail: "2.1 km away",
    icon: UserCheck,
  },
  {
    time: "18:41",
    title: "Food collected",
    detail: "OTP verified",
    icon: ShieldCheck,
  },
  {
    time: "19:02",
    title: "Delivered",
    detail: "Community kitchen",
    icon: CheckCircle2,
  },
];

const nearby = [
  { label: "3 donors within 3 km", icon: Building2 },
  { label: "2 receivers with capacity", icon: Users },
  { label: "5 volunteers available", icon: MapPin },
];

export default function DashboardPreview() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 min-w-0">
      <p className="mb-3 text-center text-xs text-muted-foreground">
        Preview of the Tripti dashboard · fictional demo data
      </p>

      <div
        aria-hidden="true"
        className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
      >
        {/* Browser header bar */}
        <div className="h-11 border-b border-border bg-muted flex items-center gap-3 px-4">
          <div className="flex items-center gap-1.5">
            <span className="block size-2.5 rounded-full bg-destructive" />
            <span className="block size-2.5 rounded-full bg-accent" />
            <span className="block size-2.5 rounded-full bg-secondary" />
          </div>
          <div className="flex-1 flex justify-center min-w-0">
            <span className="rounded-md bg-background border border-border px-3 py-1 text-xs text-muted-foreground truncate">
              Tripti.app/dashboard
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Circle className="size-3 text-primary" />
            <span>Demo data</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="border-b border-border p-4 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2 mb-3 lg:mb-6">
              <Leaf className="size-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Tripti</span>
            </div>
            <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.label}
                    className={
                      item.active
                        ? "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground"
                        : "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
                    }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                );
              })}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 p-4 sm:p-6">
            <p className="text-xs tracking-widest text-muted-foreground">OVERVIEW</p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">Rescue Overview</h3>

            <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-border bg-background p-4 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5" />
                      <span className="truncate">{metric.label}</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.sublabel}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">Food listings</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Listing</th>
                      <th className="hidden sm:table-cell px-4 py-2 font-medium">Portions</th>
                      <th className="hidden sm:table-cell px-4 py-2 font-medium">Pickup by</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((row) => {
                      const style = statusStyles[row.status as keyof typeof statusStyles];
                      const StatusIcon = style.icon;
                      return (
                        <tr key={row.name} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 min-w-0">
                            <p className="font-medium text-foreground">{row.name}</p>
                            <p className="text-xs text-muted-foreground">{row.donor}</p>
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 tabular-nums text-foreground">
                            {row.portions}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 tabular-nums text-foreground">
                            {row.pickup}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}
                            >
                              <StatusIcon className="size-3" />
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {/* Right panel */}
          <aside className="border-t border-border p-4 sm:p-6 lg:w-72 lg:shrink-0 lg:border-t-0 lg:border-l">
            <h4 className="text-sm font-semibold text-foreground">Rescue activity</h4>
            <ol className="mt-4 ml-2 border-l border-border">
              {timeline.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="relative pl-4 pb-4 last:pb-0">
                    <span className="absolute -left-5 top-1 flex size-2 rounded-full bg-primary" />
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5 text-primary" />
                      <span className="tabular-nums">{item.time}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold text-foreground">Nearby summary</p>
              <ul className="mt-2 space-y-2">
                {nearby.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="size-3.5 text-primary" />
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Illustrative demo. Figures are fictional and are not live platform data.
        </div>
      </div>
    </section>
  );
}