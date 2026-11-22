import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Search,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import {
  receiverProfiles,
  foodRequests,
  listingReservations,
} from "@/db/schema/requests";
import { foodListings } from "@/db/schema/listings";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CapacityManager } from "@/components/receiver/capacity-manager";
import { OrderTrackingCard } from "@/components/orders/order-tracking-card";
import { ImpactDashboardView } from "@/components/impact/impact-dashboard-view";
import { DiscoverFoodView } from "@/components/receiver/discover-food-view";
import { PostFoodRequestDialog } from "@/components/receiver/post-food-request-dialog";
import { ReceiverRequestsTable } from "@/components/receiver/receiver-requests-table";
import { MapDualView } from "@/components/maps/map-dual-view";
import { calculateHaversineDistanceKm } from "@/lib/maps/haversine";
import { MapMarker } from "@/lib/maps/types";
import { ROLE_MARKER_COLORS } from "@/lib/maps/map-styles";
import { FOOD_SAFETY_DISCLAIMER } from "@/lib/constants/food-safety";

async function ReceiverDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "receiver" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const orgName =
    user.organisationName || user.displayName || "Receiver Organisation";

  // Fetch or initialize receiver profile
  let [profile] = await db
    .select()
    .from(receiverProfiles)
    .where(eq(receiverProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    const [created] = await db
      .insert(receiverProfiles)
      .values({
        userId: user.id,
        dailyCapacityPortions: 150,
        currentCapacityPortions: 150,
        serviceRadiusKm: 10,
        dietaryPreferences: "Vegetarian, Cooked Meals, Fresh Produce",
        operatingHours: "08:30 - 22:00",
      })
      .returning();
    profile = created;
  }

  // Fetch reservations count
  const reservations = await db
    .select()
    .from(listingReservations)
    .where(eq(listingReservations.receiverId, user.id));

  const totalPortionsClaimed = reservations.reduce(
    (acc, cur) => acc + cur.portionsReserved,
    0
  );

  // Receiver reference coordinates (DLF Cybercity, Gachibowli)
  const receiverLat = 17.4435;
  const receiverLng = 78.3571;

  // Fetch active listings and volunteers for the map
  const activeListings = await db
    .select()
    .from(foodListings)
    .where(eq(foodListings.status, "available"));

  const availableVolunteers = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.availabilityStatus, "available"));

  const mapMarkers: MapMarker[] = [];

  activeListings.forEach((listing) => {
    const lat = parseFloat(listing.latitude);
    const lng = parseFloat(listing.longitude);
    const distance = calculateHaversineDistanceKm(receiverLat, receiverLng, lat, lng);

    mapMarkers.push({
      id: `donor-${listing.id}`,
      role: "donor",
      title: listing.title,
      subtitle: listing.organisationName,
      status: listing.status,
      latitude: lat,
      longitude: lng,
      locationName: listing.locationName,
      portions: listing.remainingPortions,
      dietType: listing.dietType,
      foodCategory: listing.foodCategory,
      distanceKm: distance,
      color: ROLE_MARKER_COLORS.donor.bg,
    });
  });

  availableVolunteers.forEach((vol) => {
    const lat = parseFloat(vol.latitude);
    const lng = parseFloat(vol.longitude);
    const distance = calculateHaversineDistanceKm(receiverLat, receiverLng, lat, lng);

    mapMarkers.push({
      id: `volunteer-${vol.id}`,
      role: "volunteer",
      title: "Rescue Courier",
      subtitle: `Mode: ${vol.transportMode.toUpperCase()}`,
      status: vol.availabilityStatus,
      latitude: lat,
      longitude: lng,
      locationName: vol.locationName,
      distanceKm: distance,
      color: ROLE_MARKER_COLORS.volunteer.available.bg,
    });
  });

  // Current receiver pin
  mapMarkers.push({
    id: `receiver-current`,
    role: "receiver",
    title: `Your Kitchen (${orgName})`,
    subtitle: `${profile.currentCapacityPortions} Portions Capacity`,
    status: "active",
    latitude: receiverLat,
    longitude: receiverLng,
    locationName: "Gachibowli Center",
    distanceKm: 0,
    color: ROLE_MARKER_COLORS.receiver.bg,
  });

  return (
    <div className="space-y-8">
      {/* Console Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>Receiver Community Console</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {orgName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Request, discover, and coordinate food deliveries for your community.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <PostFoodRequestDialog />
          <Link
            href="#discover"
            className={buttonVariants({
              variant: "outline",
              className: "gap-1.5",
            })}
          >
            <Search className="size-4" />
            <span>Discover Food</span>
          </Link>
        </div>
      </div>

      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Meals Reserved</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {totalPortionsClaimed} Portions
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Surplus allocated to your center
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Current Capacity</span>
            <HeartHandshake className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {profile.currentCapacityPortions} / {profile.dailyCapacityPortions}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Portions can accept today
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Deliveries</span>
            <Truck className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {reservations.filter((r) => r.status === "confirmed").length} Active
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              In rescue coordination
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Dispatch Radius</span>
            <MapPin className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {profile.serviceRadiusKm} km
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Configured receiver scope
            </p>
          </div>
        </div>
      </div>

      {/* Receiver Capacity & Preferences Manager */}
      <CapacityManager profile={profile} />

      {/* Active Orders & Delivery Handshakes */}
      <OrderTrackingCard role="receiver" userId={user.id} />

      {/* Verified Shelter Nourishment & Community Impact */}
      <ImpactDashboardView
        scope="mine"
        title="Shelter Nourishment & Impact Footprint"
        subtitle="Verified rescued food portions received and distributed by your organisation."
      />

      {/* Map Spatial Radar Dual View */}
      <MapDualView
        markers={mapMarkers}
        center={{ lat: receiverLat, lng: receiverLng }}
        currentLocationName="DLF Cybercity, Gachibowli"
        title="Surplus Proximity & Partner Radar"
        description="View nearby available surplus food listings and volunteer couriers within your rescue service radius."
      />

      {/* Food Discovery Section */}
      <div id="discover" className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Discover Available Surplus Food
          </h2>
          <p className="text-xs text-muted-foreground">
            Browse surplus food posted by nearby restaurants, caterers, and canteens.
          </p>
        </div>
        <DiscoverFoodView receiverProfile={profile} />
      </div>

      {/* Active Needs / Requests Table */}
      <ReceiverRequestsTable receiverId={user.id} />

      {/* Food Safety & Responsibility Disclaimer */}
      <div className="rounded-xl border border-border bg-muted/20 p-5 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">
          Food Safety Notice for Receivers
        </div>
        <p className="leading-relaxed">{FOOD_SAFETY_DISCLAIMER}</p>
        <div className="mt-2 text-[11px] text-muted-foreground/80">
          Receivers receive rescued food with zero participation fee. Verify temperature and visual condition before distribution.
        </div>
      </div>
    </div>
  );
}

export default function ReceiverDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading receiver console&hellip;</p>
        </div>
      }
    >
      <ReceiverDashboardContent />
    </Suspense>
  );
}