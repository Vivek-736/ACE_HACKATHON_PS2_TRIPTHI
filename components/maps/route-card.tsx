"use client";

import { RouteSummary } from "@/lib/maps/types";
import { ArrowRight, Clock, MapPin, Navigation, ShieldCheck } from "lucide-react";

interface RouteCardProps {
  route: RouteSummary | null;
  onClear?: () => void;
}

export function RouteCard({ route, onClear }: RouteCardProps) {
  if (!route) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Rescue Route Preview
            </h4>
            <p className="text-xs text-muted-foreground">
              Direct ground trajectory via Google Routes
            </p>
          </div>
        </div>

        {onClear && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Route
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/30 p-2.5">
          <span className="text-[11px] font-medium uppercase text-muted-foreground">
            Travel Distance
          </span>
          <p className="text-base font-bold text-foreground">
            {route.distanceKm.toFixed(1)} km
          </p>
        </div>

        <div className="rounded-lg bg-muted/30 p-2.5">
          <span className="text-[11px] font-medium uppercase text-muted-foreground">
            Estimated ETA
          </span>
          <p className="text-base font-bold text-primary">
            ~{route.durationMinutes} mins
          </p>
        </div>

        <div className="col-span-2 rounded-lg bg-primary/5 p-2.5">
          <span className="text-[11px] font-medium uppercase text-primary">
            Route Handoff
          </span>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground font-medium truncate">
            <span className="truncate">{route.origin.label}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{route.destination.label}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/40 pt-2.5">
        <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
        <span>
          Calculated for two-wheeler rescue courier. Actual travel time may vary with traffic.
        </span>
      </div>
    </div>
  );
}
