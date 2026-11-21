"use client";

import { useState } from "react";
import { MapMarker, RouteSummary } from "@/lib/maps/types";
import { RescueMap } from "./rescue-map";
import { RouteCard } from "./route-card";
import {
  List,
  Map as MapIcon,
  Navigation,
  SlidersHorizontal,
  Clock,
  Utensils,
  Home,
  Bike,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface MapDualViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  currentLocationName?: string;
  onSelectCandidate?: (marker: MapMarker) => void;
  title?: string;
  description?: string;
}

export function MapDualView({
  markers,
  center,
  currentLocationName = "Madhapur, Hyderabad",
  onSelectCandidate,
  title = "Rescue Operations Map & Spatial Radar",
  description = "Locate nearby food donors, community receivers, and active rescue volunteers.",
}: MapDualViewProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [roleFilter, setRoleFilter] = useState<"all" | "donor" | "receiver" | "volunteer">("all");
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteSummary | null>(null);

  // Filter markers based on chosen role
  const filteredMarkers = markers.filter((m) => {
    if (roleFilter === "all") return true;
    return m.role === roleFilter;
  });

  // Calculate route between current location / selected marker and a target candidate
  const handleCalculateRoute = (target: MapMarker) => {
    setSelectedMarker(target);

    // Compute route preview
    const originCoords = center || { lat: 17.4483, lng: 78.3815 };
    const distanceKm = target.distanceKm || 4.2;
    const durationMinutes = Math.max(5, Math.ceil((distanceKm / 28) * 60 + 3));

    setActiveRoute({
      origin: {
        lat: originCoords.lat,
        lng: originCoords.lng,
        label: currentLocationName,
      },
      destination: {
        lat: target.latitude,
        lng: target.longitude,
        label: `${target.title} (${target.locationName})`,
      },
      distanceKm,
      durationMinutes,
      steps: [
        `Depart from ${currentLocationName}`,
        `Travel via arterial avenue toward ${target.locationName}`,
        `Arrive at ${target.title} for verified handoff`,
      ],
    });

    if (onSelectCandidate) {
      onSelectCandidate(target);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Dual View Toggle & Role Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter Pills */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setRoleFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                roleFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({markers.length})
            </button>
            <button
              onClick={() => setRoleFilter("donor")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                roleFilter === "donor"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Donors ({markers.filter((m) => m.role === "donor").length})
            </button>
            <button
              onClick={() => setRoleFilter("receiver")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                roleFilter === "receiver"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Receivers ({markers.filter((m) => m.role === "receiver").length})
            </button>
            <button
              onClick={() => setRoleFilter("volunteer")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                roleFilter === "volunteer"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Volunteers ({markers.filter((m) => m.role === "volunteer").length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Route Summary Card */}
      {activeRoute && (
        <RouteCard route={activeRoute} onClear={() => setActiveRoute(null)} />
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <RescueMap
          markers={filteredMarkers}
          center={center}
          selectedMarkerId={selectedMarker?.id}
          activeRoute={activeRoute}
          onMarkerClick={handleCalculateRoute}
          className="h-[460px] w-full"
        />
      )}

      {/* Accessible List View */}
      {viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Role & Entity</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Capacity / Portions</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMarkers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No candidates found matching the selected role.
                    </td>
                  </tr>
                ) : (
                  filteredMarkers.map((marker) => (
                    <tr
                      key={marker.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        selectedMarker?.id === marker.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs"
                            style={{
                              backgroundColor: `${marker.color}20`,
                              color: marker.color,
                            }}
                          >
                            {marker.role === "donor"
                              ? "🍽️"
                              : marker.role === "receiver"
                              ? "🏠"
                              : "🚴"}
                          </span>
                          <div>
                            <div className="font-semibold text-foreground">
                              {marker.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {marker.subtitle || marker.role.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>📍</span>
                          <span>{marker.locationName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-foreground">
                        {marker.portions !== undefined ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            🍱 {marker.portions} portions
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {marker.distanceKm !== undefined ? (
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            {marker.distanceKm.toFixed(1)} km
                          </span>
                        ) : (
                          <span className="text-muted-foreground">~4.0 km</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleCalculateRoute(marker)}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-7 gap-1 text-xs",
                          })}
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Route</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
