"use client";

import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface LiveStatusIndicatorProps {
  lastUpdated: Date | null;
  timeAgoText?: string;
  isStale?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  label?: string;
  compact?: boolean;
}

export function LiveStatusIndicator({
  lastUpdated,
  timeAgoText = "Just now",
  isStale = false,
  isError = false,
  isLoading = false,
  onRefresh,
  label = "Live Sync",
  compact = false,
}: LiveStatusIndicatorProps) {
  if (isError) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <WifiOff className="size-3.5 animate-pulse" />
        <span>Offline / Connection Degraded</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="ml-1 underline font-semibold hover:text-destructive"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning-foreground">
        <AlertCircle className="size-3.5 text-warning" />
        <span>Stale Data ({timeAgoText})</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="ml-1 text-foreground underline hover:text-primary"
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        {!compact && <span className="font-semibold">{label}</span>}
        <span className="text-muted-foreground text-[11px]">&bull; {timeAgoText}</span>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          title="Force refresh server data"
          className="rounded-md border border-border bg-card p-1 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
        </button>
      )}
    </div>
  );
}
