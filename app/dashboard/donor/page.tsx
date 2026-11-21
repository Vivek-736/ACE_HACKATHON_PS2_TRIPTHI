import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Clock,
  ExternalLink,
  Flame,
  Leaf,
  PlusCircle,
  TrendingUp,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings } from "@/db/schema/listings";
import { foodRequests } from "@/db/schema/requests";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { QuickPostDialog } from "@/components/donor/quick-post-dialog";
import { DonorListingsTable } from "@/components/donor/donor-listings-table";
import { OrderTrackingCard } from "@/components/orders/order-tracking-card";
import { MapDualView } from "@/components/maps/map-dual-view";
import { calculateHaversineDistanceKm } from "@/lib/maps/haversine";
import { MapMarker } from "@/lib/maps/types";
import { ROLE_MARKER_COLORS } from "@/lib/maps/map-styles";
import { FOOD_SAFETY_DISCLAIMER } from "@/lib/constants/food-safety";

async function DonorDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "donor" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const orgName =
    user.organisationName || user.displayName || "Food Donor Partner";

  // Donor reference coordinates (Cyber Pearl, Madhapur)
  const donorLat = 17.4483;
  const donorLng = 78.3815;

  // Fetch donor's live aggregate numbers
  const listings = await db
    .select()
    .from(foodListings)
    .where(eq(foodListings.donorId, user.id));

  const activeCount = listings.filter((l) => l.status === "available").length;
  const totalPortionsPosted = listings.reduce(
    (acc, cur) => acc + cur.quantityPortions,
    0
  );
  const totalPortionsRescued = listings
    .filter((l) => l.status === "completed" || l.status === "reserved")
    .reduce((acc, cur) => acc + (cur.quantityPortions - cur.remainingPortions), 0);

  // Impact assumptions: 0.42 kg waste avoided & 0.84 kg CO2e per portion
  const wasteAvoidedKg = (totalPortionsRescued * 0.42).toFixed(1);
  const emissionsAvoidedKg = (totalPortionsRescued * 0.84).toFixed(1);

  // Fetch receiver requests and volunteers for spatial map
  const activeRequests = await db
    .select()
    .from(foodRequests)
    .where(eq(foodRequests.status, "active"));

  const availableVolunteers = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.availabilityStatus, "available"));

  const mapMarkers: MapMarker[] = [];

  // Add Donor's own listings
  listings
    .filter((l) => l.status === "available")
    .forEach((l) => {
      mapMarkers.push({
        id: `donor-${l.id}`,
        role: "donor",
        title: l.title,
        subtitle: orgName,
        status: l.status,
        latitude: parseFloat(l.latitude),
        longitude: parseFloat(l.longitude),
        locationName: l.locationName,
        portions: l.remainingPortions,
        dietType: l.dietType,
        foodCategory: l.foodCategory,
        distanceKm: 0,
        color: ROLE_MARKER_COLORS.donor.bg,
      });
    });

  // Add Nearby Receiver Needs
  activeRequests.forEach((req) => {
    const lat = parseFloat(req.latitude);
    const lng = parseFloat(req.longitude);
    const distance = calculateHaversineDistanceKm(donorLat, donorLng, lat, lng);

    mapMarkers.push({
      id: `receiver-${req.id}`,
      role: "receiver",
      title: req.title,
      subtitle: req.organisationName,
      status: req.status,
      latitude: lat,
      longitude: lng,
      locationName: req.locationName,
      portions: req.requestedPortions,
      dietType: req.dietaryConstraints || "Any",
      distanceKm: distance,
      color: ROLE_MARKER_COLORS.receiver.bg,
    });
  });

  // Add Nearby Active Couriers
  availableVolunteers.forEach((vol) => {
    const lat = parseFloat(vol.latitude);
    const lng = parseFloat(vol.longitude);
    const distance = calculateHaversineDistanceKm(donorLat, donorLng, lat, lng);

    mapMarkers.push({
      id: `volunteer-${vol.id}`,
      role: "volunteer",
      title: "Active Volunteer Courier",
      subtitle: `Mode: ${vol.transportMode.toUpperCase()}`,
      status: vol.availabilityStatus,
      latitude: lat,
      longitude: lng,
      locationName: vol.locationName,
      distanceKm: distance,
      color: ROLE_MARKER_COLORS.volunteer.available.bg,
    });
  });

  return (
    <div className="space-y-8">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>Donor Console</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {orgName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Publish surplus food in under 60 seconds and track handoffs.
          </p>
        </div>

        {/* Quick Post Action */}
        <div className="flex items-center gap-3">
          <QuickPostDialog />
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Listings</span>
            <UtensilsCrossed className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {activeCount} Available
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Open for claim &amp; pickup
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Portions Allocated</span>
            <Flame className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {totalPortionsRescued}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Portions reserved / delivered
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Surplus Posted</span>
            <Clock className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {totalPortionsPosted} Portions
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {listings.length} listings
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Emissions Avoided</span>
            <Leaf className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {emissionsAvoidedKg} kg CO₂e
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {wasteAvoidedKg} kg food waste prevented
            </p>
          </div>
        </div>
      </div>

      {/* Active Orders & Verification OTPs */}
      <OrderTrackingCard role="donor" userId={user.id} />

      {/* Live Listings Table */}
      <div id="post-surplus">
        <DonorListingsTable donorId={user.id} />
      </div>

      {/* Spatial Proximity Map */}
      <MapDualView
        markers={mapMarkers}
        center={{ lat: donorLat, lng: donorLng }}
        currentLocationName="Cyber Pearl, Madhapur"
        title="Nearby Receiver Shelters & Volunteer Couriers"
        description="View community kitchens waiting for surplus food and available rescue volunteers within your area."
      />

      {/* Food Safety & Responsibility Disclaimer */}
      <div className="rounded-xl border border-border bg-muted/20 p-5 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">
          Food Safety &amp; Operational Standards
        </div>
        <p className="leading-relaxed">{FOOD_SAFETY_DISCLAIMER}</p>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Impact assumptions: 0.42 kg food waste avoided and 0.84 kg CO₂e emissions reduction per delivered meal portion.
        </div>
      </div>
    </div>
  );
}

export default function DonorDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading donor console&hellip;</p>
        </div>
      }
    >
      <DonorDashboardContent />
    </Suspense>
  );
}
