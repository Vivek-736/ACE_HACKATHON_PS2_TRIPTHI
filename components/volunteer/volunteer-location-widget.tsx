"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_LOCATIONS, DemoLocation } from "@/lib/constants/demo-locations";
import { TRANSPORT_MODES } from "@/db/schema/volunteers";
import {
  Bike,
  Car,
  CheckCircle2,
  Footprints,
  MapPin,
  Power,
  Truck,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useVolunteerAvailability } from "@/hooks/use-volunteer-availability";

interface VolunteerLocationWidgetProps {
  initialLocationName: string;
  initialAvailability: string;
  initialTransportMode: string;
  onLocationChange?: (lat: number, lng: number, name: string) => void;
}

export function VolunteerLocationWidget({
  initialLocationName,
  initialAvailability,
  initialTransportMode,
  onLocationChange,
}: VolunteerLocationWidgetProps) {
  const router = useRouter();

  // Use TanStack Query Hook with optimistic status toggle & invalidation
  const { profile, toggleAvailability, isToggling } = useVolunteerAvailability();

  // Local state for instant feedback without waiting on network hops
  const [localAvailability, setLocalAvailability] = useState<string>(
    profile?.availabilityStatus || initialAvailability
  );

  useEffect(() => {
    if (profile?.availabilityStatus) {
      setLocalAvailability(profile.availabilityStatus);
    }
  }, [profile?.availabilityStatus]);

  const [locationName, setLocationName] = useState(
    profile?.locationName || initialLocationName
  );
  const [transportMode, setTransportMode] = useState(
    profile?.transportMode || initialTransportMode
  );

  useEffect(() => {
    if (profile?.locationName) {
      setLocationName(profile.locationName);
    }
    if (profile?.transportMode) {
      setTransportMode(profile.transportMode);
    }
  }, [profile?.locationName, profile?.transportMode]);

  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggleDuty = async () => {
    const previousStatus = localAvailability;
    const nextStatus = previousStatus === "available" ? "offline" : "available";

    // Instant local state transition (no glitch / no rollback)
    setLocalAvailability(nextStatus);
    setMessage(null);

    try {
      await toggleAvailability(nextStatus);
      setMessage(`Status changed to ${nextStatus.toUpperCase()}`);
      router.refresh();
    } catch (e) {
      console.error(e);
      setLocalAvailability(previousStatus); // Revert on actual server failure
      setMessage("Failed to update availability status");
    }
  };

  const handleLocationSelect = async (locName: string) => {
    const loc = DEMO_LOCATIONS.find((d: DemoLocation) => d.name === locName);
    if (!loc) return;

    setLocationName(loc.name);
    setIsUpdatingLocation(true);
    setMessage(null);

    try {
      const res = await fetch("/api/volunteers/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          transportMode,
        }),
      });

      if (res.ok) {
        setMessage(`Relocated to ${loc.name}`);
        onLocationChange?.(loc.latitude, loc.longitude, loc.name);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleTransportModeChange = async (mode: string) => {
    setTransportMode(mode);
    const loc =
      DEMO_LOCATIONS.find((d: DemoLocation) => d.name === locationName) ||
      DEMO_LOCATIONS[0];

    try {
      const res = await fetch("/api/volunteers/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          transportMode: mode,
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              localAvailability === "available"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isToggling ? (
              <Spinner className="h-4 w-4 text-primary" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">
                Duty Status &amp; Dispatch Staging
              </h4>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  localAvailability === "available"
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {localAvailability.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Controls your visibility on the real-time rescue dispatch radar
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleDuty}
          disabled={isToggling || isUpdatingLocation}
          className={buttonVariants({
            variant: localAvailability === "available" ? "outline" : "default",
            size: "sm",
            className: "text-xs font-semibold gap-1.5 h-8",
          })}
        >
          {isToggling ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Power className="h-3.5 w-3.5" />
          )}
          <span>{localAvailability === "available" ? "Go Offline" : "Go Available"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Staging Location Selector */}
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Active Staging Zone (Demo Coordinates)</span>
          </label>
          <select
            value={locationName}
            onChange={(e) => handleLocationSelect(e.target.value)}
            disabled={isUpdatingLocation}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <optgroup label="Andhra Pradesh — Vijayawada">
              {DEMO_LOCATIONS.filter((l) => l.city === "Vijayawada").map((loc: DemoLocation) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </optgroup>
            <optgroup label="Andhra Pradesh — Visakhapatnam (Vizag)">
              {DEMO_LOCATIONS.filter((l) => l.city === "Visakhapatnam").map((loc: DemoLocation) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </optgroup>
            <optgroup label="Andhra Pradesh — Other Hubs">
              {DEMO_LOCATIONS.filter(
                (l) =>
                  l.state === "Andhra Pradesh" &&
                  l.city !== "Vijayawada" &&
                  l.city !== "Visakhapatnam"
              ).map((loc: DemoLocation) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.city})
                </option>
              ))}
            </optgroup>
            <optgroup label="Telangana — Hyderabad">
              {DEMO_LOCATIONS.filter((l) => l.city === "Hyderabad").map((loc: DemoLocation) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </optgroup>
            <optgroup label="Other South Hubs (Bengaluru / Chennai)">
              {DEMO_LOCATIONS.filter(
                (l) => l.state !== "Telangana" && l.state !== "Andhra Pradesh"
              ).map((loc: DemoLocation) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name} ({loc.city})
                </option>
              ))}
            </optgroup>
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Synthetic coordinates shield personal residential privacy in demo mode.
          </p>
        </div>

        {/* Transport Mode */}
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <Bike className="h-3.5 w-3.5 text-primary" />
            <span>Transport Mode (Speeds &amp; Route Calculation)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {TRANSPORT_MODES.map((mode) => {
              const icon =
                mode === "delivery_truck" ? (
                  <Truck className="h-3.5 w-3.5 inline mr-1" />
                ) : mode === "car" ? (
                  <Car className="h-3.5 w-3.5 inline mr-1" />
                ) : mode === "bicycle" ? (
                  <Bike className="h-3.5 w-3.5 inline mr-1" />
                ) : mode === "on_foot" ? (
                  <Footprints className="h-3.5 w-3.5 inline mr-1" />
                ) : (
                  <Zap className="h-3.5 w-3.5 inline mr-1" />
                );

              const label =
                mode === "delivery_truck"
                  ? "Delivery Truck"
                  : mode === "on_foot"
                  ? "On Foot"
                  : mode === "motorcycle"
                  ? "Motorcycle"
                  : mode === "bicycle"
                  ? "Bicycle"
                  : "Car";

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleTransportModeChange(mode)}
                  className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-center text-xs font-medium capitalize transition-colors ${
                    transportMode === mode
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Adjusts speed matrix and road accessibility for pickup routes.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
