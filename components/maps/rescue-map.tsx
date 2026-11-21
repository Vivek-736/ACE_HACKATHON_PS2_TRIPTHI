"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useGoogleMaps } from "@/lib/maps/use-google-maps";
import { MapMarker, RouteSummary } from "@/lib/maps/types";
import { TRIPTI_MAP_STYLES, MAP_CENTER_DEFAULT } from "@/lib/maps/map-styles";
import {
  Compass,
  Info,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface RescueMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string | null;
  activeRoute?: RouteSummary | null;
  className?: string;
}

export function RescueMap({
  markers,
  center = MAP_CENTER_DEFAULT,
  zoom = 13,
  onMarkerClick,
  selectedMarkerId,
  activeRoute,
  className = "h-[480px] w-full",
}: RescueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const fallbackPolylineRef = useRef<google.maps.Polyline | null>(null);
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [internalSelectedMarker, setInternalSelectedMarker] = useState<MapMarker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (
      !isLoaded ||
      !mapRef.current ||
      mapInstanceRef.current ||
      typeof window.google === "undefined" ||
      typeof window.google.maps === "undefined" ||
      typeof window.google.maps.Map !== "function"
    ) {
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: TRIPTI_MAP_STYLES,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      if (typeof google.maps.DirectionsRenderer === "function") {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#1b4d3e", // Tripti deep forest green
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        });
        directionsRendererRef.current = directionsRenderer;
      }
    } catch (e) {
      console.error("Error creating Google Map instance:", e);
      setRuntimeError("MAP_INIT_ERROR");
    }
  }, [isLoaded, center, zoom]);

  // Update Markers on Map
  useEffect(() => {
    if (
      !isLoaded ||
      !mapInstanceRef.current ||
      typeof window.google === "undefined" ||
      typeof window.google.maps === "undefined" ||
      typeof window.google.maps.Marker !== "function" ||
      typeof window.google.maps.LatLngBounds !== "function"
    ) {
      return;
    }

    try {
      // Clear previous markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const bounds = new google.maps.LatLngBounds();

    markers.forEach((marker) => {
      const pos = { lat: marker.latitude, lng: marker.longitude };
      bounds.extend(pos);

      // Create custom SVG Pin Icon
      const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 24 18 24s18-10.5 18-24C36 8.06 27.94 0 18 0z" fill="${marker.color}"/>
          <circle cx="18" cy="16" r="10" fill="#ffffff" opacity="0.95"/>
          <text x="18" y="20" font-size="12" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">
            ${marker.role === "donor" ? "🍽️" : marker.role === "receiver" ? "🏠" : "🚴"}
          </text>
        </svg>
      `;

      const gMarker = new google.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: marker.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg)}`,
          scaledSize: new google.maps.Size(32, 38),
          anchor: new google.maps.Point(16, 38),
        },
        animation:
          marker.id === selectedMarkerId
            ? google.maps.Animation.BOUNCE
            : undefined,
      });

      // Info Window
      const infoContent = `
        <div style="font-family: inherit; padding: 6px; max-width: 240px; color: #1a1a1a;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${marker.color}; margin-bottom: 2px;">
            ${marker.role.toUpperCase()}
          </div>
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; line-height: 1.2;">
            ${marker.title}
          </div>
          <div style="font-size: 12px; color: #555; margin-bottom: 6px;">
            📍 ${marker.locationName}
          </div>
          ${marker.portions
          ? `<div style="font-size: 12px; font-weight: 600; color: #1b4d3e; margin-bottom: 4px;">🍱 ${marker.portions} Portions available</div>`
          : ""
        }
          ${marker.distanceKm !== undefined
          ? `<div style="font-size: 11px; color: #777;">📏 ~${marker.distanceKm.toFixed(1)} km away</div>`
          : ""
        }
        </div>
      `;

      gMarker.addListener("click", () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        infoWindow.open(mapInstanceRef.current, gMarker);
        activeInfoWindowRef.current = infoWindow;
        setInternalSelectedMarker(marker);

        if (onMarkerClick) {
          onMarkerClick(marker);
        }
      });

      markersRef.current.push(gMarker);
    });

    // Fit bounds if multiple markers exist and not focused on single route
    if (markers.length > 1 && !activeRoute && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, 50);
    }
    } catch (e) {
      console.error("Error rendering map markers:", e);
    }
  }, [isLoaded, markers, selectedMarkerId, activeRoute, onMarkerClick]);

  // Route drawing via Google DirectionsService with Geodesic Polyline Fallback
  useEffect(() => {
    // Clean up previous directions and fallback line
    if (fallbackPolylineRef.current) {
      fallbackPolylineRef.current.setMap(null);
      fallbackPolylineRef.current = null;
    }

    if (!isLoaded || !activeRoute) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({
          routes: [],
        } as unknown as google.maps.DirectionsResult);
      }
      return;
    }

    const drawFallbackPolyline = () => {
      if (
        !mapInstanceRef.current ||
        typeof window.google === "undefined" ||
        typeof window.google.maps === "undefined" ||
        typeof window.google.maps.Polyline !== "function"
      ) {
        return;
      }

      const path = [
        { lat: activeRoute.origin.lat, lng: activeRoute.origin.lng },
        { lat: activeRoute.destination.lat, lng: activeRoute.destination.lng },
      ];

      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#1b4d3e", // Tripti forest green
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });

      fallbackPolylineRef.current = polyline;

      if (typeof window.google.maps.LatLngBounds === "function") {
        const bounds = new google.maps.LatLngBounds();
        path.forEach((p) => bounds.extend(p));
        mapInstanceRef.current.fitBounds(bounds, 70);
      }
    };

    try {
      if (
        typeof window.google === "undefined" ||
        typeof window.google.maps === "undefined" ||
        typeof window.google.maps.DirectionsService !== "function"
      ) {
        drawFallbackPolyline();
        return;
      }

      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: { lat: activeRoute.origin.lat, lng: activeRoute.origin.lng },
          destination: {
            lat: activeRoute.destination.lat,
            lng: activeRoute.destination.lng,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRendererRef.current?.setDirections(result);
          } else {
            // When Directions API is disabled or denied on Google Cloud, fallback to geodesic route trajectory
            drawFallbackPolyline();
          }
        }
      );
    } catch {
      drawFallbackPolyline();
    }
  }, [isLoaded, activeRoute]);

  // Fallback UI when Google Maps API key is missing or load failed
  const effectiveError = loadError || runtimeError;
  if (effectiveError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-linear-to-br from-card to-muted/20 p-6 ${className}`}
      >
        {/* Radar Background Visual */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          <div className="h-96 w-96 rounded-full border border-primary/40 animate-pulse" />
          <div className="absolute h-64 w-64 rounded-full border border-primary/50" />
          <div className="absolute h-36 w-36 rounded-full border border-primary/60" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 mb-3 border border-amber-500/20">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>

          <h3 className="text-base font-bold text-foreground">
            Interactive Rescue Spatial Radar
          </h3>

          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {effectiveError === "MISSING_KEY"
              ? "Google Maps key not configured in .env. Showing simulated rescue spatial telemetry and candidate coordinates."
              : "Google Maps service unavailable. Utilizing fallback spatial radar & distance matrix."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              {markers.filter((m) => m.role === "donor").length} Surplus Listings
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 border-emerald-600/30 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
              {markers.filter((m) => m.role === "receiver").length} Receivers
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 border-blue-600/30 text-blue-600">
              <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
              {markers.filter((m) => m.role === "volunteer").length} Volunteers
            </Badge>
          </div>

          <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-3 text-left">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/50 pb-1.5 mb-2">
              <span>Nearby Telemetry Pinpoints</span>
              <span className="text-[10px] text-muted-foreground font-mono">HYDERABAD CLUSTER</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
              {markers.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => onMarkerClick?.(m)}
                  className="flex items-center justify-between rounded-lg p-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>
                      {m.role === "donor" ? "🍽️" : m.role === "receiver" ? "🏠" : "🚴"}
                    </span>
                    <span className="font-medium text-foreground truncate">{m.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-primary shrink-0">
                    {m.distanceKm !== undefined ? `${m.distanceKm.toFixed(1)} km` : "In cluster"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-border bg-card/50 ${className}`}
      >
        <Spinner className="h-8 w-8 text-primary" />
        <span className="mt-3 text-xs font-medium text-muted-foreground">
          Loading Tripti Rescue Map...
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
      <div ref={mapRef} className={className} />

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-background/90 backdrop-blur-md px-3 py-2 text-xs shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#1b4d3e]" />
          <span className="text-[11px] font-medium text-foreground">Donors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
          <span className="text-[11px] font-medium text-foreground">Receivers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
          <span className="text-[11px] font-medium text-foreground">Volunteers</span>
        </div>
      </div>
    </div>
  );
}