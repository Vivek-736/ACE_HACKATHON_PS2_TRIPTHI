"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DEFAULT_STATUSES = [
  "Synchronizing agent network...",
  "Calibrating everyday task models...",
  "Connecting tool integrations...",
  "Preparing mission console...",
];

export interface LoadingScreenProps {
  message?: string;
  statuses?: string[];
  fullscreen?: boolean;
  className?: string;
  compact?: boolean;
}

export function LoadingScreen({
  message,
  statuses = DEFAULT_STATUSES,
  fullscreen = true,
  className,
  compact = false,
}: LoadingScreenProps) {
  const [statusIndex, setStatusIndex] = React.useState(0);

  React.useEffect(() => {
    if (message) return;
    const timer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [message, statuses.length]);

  return (
    <div
      role="status"
      aria-label="Loading TeamOrbit"
      className={cn(
        "flex flex-col items-center justify-center overflow-hidden bg-background text-foreground select-none selection:bg-foreground selection:text-background",
        fullscreen
          ? "fixed inset-0 z-50 h-screen max-h-screen w-screen"
          : "relative h-full min-h-[300px] w-full py-12",
        className
      )}
    >
      {/* Subtle Architectural Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Atmospheric Ambient Glows */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[80px]"
        aria-hidden="true"
      />

      {/* Central Orbital Assembly */}
      <div className="relative flex items-center justify-center">
        {/* Soft Radial Ambient Core */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl opacity-65"
          style={{
            background:
              "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, rgba(99, 102, 241, 0.25) 55%, transparent 75%)",
            transform: "scale(1.4)",
          }}
          aria-hidden="true"
        />

        {/* Outer Revolving Orbit Ring */}
        <div
          className={cn(
            "pointer-events-none absolute rounded-full border border-dashed border-teal-500/30 animate-spin",
            compact ? "size-32" : "size-44 sm:size-52"
          )}
          style={{ animationDuration: "24s" }}
          aria-hidden="true"
        />

        {/* Inner Counter-Rotating Orbit Ring with Satellite Beacon */}
        <div
          className={cn(
            "pointer-events-none absolute rounded-full border border-indigo-400/25 animate-spin",
            compact ? "size-24" : "size-32 sm:size-36"
          )}
          style={{ animationDuration: "7s", animationDirection: "reverse" }}
          aria-hidden="true"
        >
          {/* Glowing Satellite Orb */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.9)]" />
        </div>

        {/* Floating Flagship Bot Orbit Illustration */}
        <div className="animate-bot-float relative flex items-center justify-center">
          <Image
            src="/bots/bot-orbit.svg"
            alt="TeamOrbit Assistant Loading"
            width={compact ? 64 : 96}
            height={compact ? 64 : 96}
            priority
            className={cn(
              "drop-shadow-md select-none transition-transform duration-300",
              compact ? "size-14" : "size-20 sm:size-24"
            )}
          />
        </div>
      </div>

      {/* Brand Identity Wordmark */}
      {!compact && (
        <div className="mt-8 flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            TeamOrbit
          </span>
          <span className="rounded-full border border-border bg-secondary/80 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider backdrop-blur-xs">
            Platform
          </span>
        </div>
      )}

      {/* Sleek Indeterminate Shimmer Progress Track */}
      <div
        className={cn(
          "relative mt-4 overflow-hidden rounded-full bg-secondary",
          compact ? "h-1 w-36" : "h-1 w-48 sm:w-56"
        )}
      >
        <div className="animate-shimmer absolute inset-y-0 w-28 rounded-full bg-linear-to-r from-transparent via-teal-400 to-transparent" />
      </div>

      {/* Dynamic Telemetry Status */}
      <div className="mt-3.5 flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
        </span>
        <span className="transition-all duration-300">
          {message ?? statuses[statusIndex]}
        </span>
      </div>

      {/* Subtle Bottom System Badge */}
      {fullscreen && !compact && (
        <div className="absolute bottom-6 text-center text-[11px] font-mono tracking-wider text-muted-foreground/60">
          AI AGENT PIPELINE ACTIVE
        </div>
      )}
    </div>
  );
}