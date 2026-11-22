import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Award,
  CheckCircle,
  Clock,
  Compass,
  MapPin,
  Navigation,
  ShieldCheck,
  Utensils,
  Layers,
} from "lucide-react";
import { getCurrentUser, dashboardPathFor } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { volunteerProfiles } from "@/db/schema/volunteers";
import { foodListings } from "@/db/schema/listings";
import { foodRequests } from "@/db/schema/requests";
import { Spinner } from "@/components/ui/spinner";
import { VolunteerLocationWidget } from "@/components/volunteer/volunteer-location-widget";
import { VolunteerOrderConsole } from "@/components/volunteer/volunteer-order-console";
import { VolunteerCreditsCard } from "@/components/volunteer/volunteer-credits-card";
import { MapDualView } from "@/components/maps/map-dual-view";
import { calculateHaversineDistanceKm } from "@/lib/maps/haversine";
import { MapMarker } from "@/lib/maps/types";
import { ROLE_MARKER_COLORS } from "@/lib/maps/map-styles";

async function VolunteerDashboardContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role === "unassigned") {
    redirect("/onboarding");
  }

  if (user.role !== "volunteer" && user.role !== "admin") {
    redirect(dashboardPathFor(user.role));
  }

  const volunteerName = user.displayName || user.firstName || "Volunteer Courier";

  // Fetch or initialize volunteer profile
  let [profile] = await db
    .select()
    .from(volunteerProfiles)
    .where(eq(volunteerProfiles.userId, user.id))
    .limit(1);

  if (!profile) {
    [profile] = await db
      .insert(volunteerProfiles)
      .values({
        userId: user.id,
        availabilityStatus: "available",
        preferredRadiusKm: 10,
        transportMode: "motorcycle",
        locationName: "Cyber Pearl, Madhapur",
        latitude: "17.4483",
        longitude: "78.3815",
        rescueCredits: 120,
        totalDeliveries: 8,
        onTimeRate: "100.00",
      })
      .returning();
  }

  const volLat = parseFloat(profile.latitude);
  const volLng = parseFloat(profile.longitude);

  // Fetch active listings and receiver needs to build map markers
  const activeListings = await db
    .select()
    .from(foodListings)
    .where(eq(foodListings.status, "available"));

  const activeRequests = await db
    .select()
    .from(foodRequests)
    .where(eq(foodRequests.status, "active"));

  const markers: MapMarker[] = [];

  // Add Donor Markers
  activeListings.forEach((listing) => {
    const lat = parseFloat(listing.latitude);
    const lng = parseFloat(listing.longitude);
    const distance = calculateHaversineDistanceKm(volLat, volLng, lat, lng);

    markers.push({
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

  // Add Receiver Markers
  activeRequests.forEach((req) => {
    const lat = parseFloat(req.latitude);
    const lng = parseFloat(req.longitude);
    const distance = calculateHaversineDistanceKm(volLat, volLng, lat, lng);

    markers.push({
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

  // Add current volunteer marker
  markers.push({
    id: `volunteer-${profile.id}`,
    role: "volunteer",
    title: `You (${volunteerName})`,
    subtitle: `Mode: ${profile.transportMode.toUpperCase()}`,
    status: profile.availabilityStatus,
    latitude: volLat,
    longitude: volLng,
    locationName: profile.locationName,
    distanceKm: 0,
    color:
      profile.availabilityStatus === "available"
        ? ROLE_MARKER_COLORS.volunteer.available.bg
        : ROLE_MARKER_COLORS.volunteer.offline.bg,
  });

  return (
    <div className="space-y-6">
      {/* Console Welcome & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <span>Rescue Volunteer Console</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {volunteerName}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Pick up surplus food and deliver it to nearby community receivers before expiry.
          </p>
        </div>

        {/* Live Staging Indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs">
          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          <div>
            <div className="font-semibold text-foreground text-xs sm:text-sm">{profile.locationName}</div>
            <div className="text-[10px] sm:text-[11px] text-muted-foreground">
              {profile.transportMode.toUpperCase()} &bull; {profile.preferredRadiusKm} km Radius
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Staging & Duty Status Control */}
      <VolunteerLocationWidget
        initialLocationName={profile.locationName}
        initialAvailability={profile.availabilityStatus}
        initialTransportMode={profile.transportMode}
      />

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Completed Rescues</span>
            <CheckCircle className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {profile.totalDeliveries} Missions
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">Delivered safely on time</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Rescue Credits</span>
            <Award className="size-4 text-accent-foreground" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {profile.rescueCredits} Credits
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">Non-cash recognition points</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Active Zone Scope</span>
            <Navigation className="size-4 text-secondary-foreground" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {profile.preferredRadiusKm} km
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">Dispatch search radius</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] sm:text-xs font-medium">Reliability Score</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {profile.onTimeRate}%
            </div>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground">Verified on-time handoffs</p>
          </div>
        </div>
      </div>

      {/* Volunteer Credits Ledger & Recognition Tier */}
      <VolunteerCreditsCard />

      {/* Volunteer Active Missions & Rescue Opportunities */}
      <VolunteerOrderConsole volunteerUserId={user.id} />

      {/* Interactive Map & Spatial Radar Dual View */}
      <MapDualView
        markers={markers}
        center={{ lat: volLat, lng: volLng }}
        currentLocationName={profile.locationName}
        title="Live Rescue Dispatch Radar & Nearby Missions"
        description="Select any nearby surplus food pin to preview the delivery route, travel distance, and ETA."
      />

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
        <span>
          * Rescue Credits are non-cash community recognition points. Delivery compensation is funded
          by donors and CSR sponsors, never charged to volunteers.
        </span>
      </div>
    </div>
  );
}

export default function VolunteerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Spinner className="size-6 text-primary" />
          <p>Loading volunteer console&hellip;</p>
        </div>
      }
    >
      <VolunteerDashboardContent />
    </Suspense>
  );
}
