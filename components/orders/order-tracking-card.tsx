"use client";

import {
  Clock,
  KeyRound,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { LiveStatusIndicator } from "@/components/shared/live-status-indicator";
import { useActiveOrders } from "@/hooks/use-active-orders";
import type { OrderStatus } from "@/db/schema/orders";

interface OrderTrackingCardProps {
  role: "donor" | "receiver";
  userId: string;
}

export function OrderTrackingCard({ role }: OrderTrackingCardProps) {
  // Use TanStack Query Hook with 10s auto-polling, visibility pause, and instant mutation invalidation
  const {
    orders,
    isLoading,
    isError,
    isStale,
    lastUpdated,
    timeAgoText,
    refetch,
  } = useActiveOrders();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            Awaiting Volunteer
          </span>
        );
      case "accepted":
        return (
          <span className="rounded-full bg-secondary/30 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            Volunteer En Route to Donor
          </span>
        );
      case "at_pickup":
        return (
          <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
            At Donor Facility
          </span>
        );
      case "collected":
        return (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            In Transit to Receiver
          </span>
        );
      case "at_receiver":
        return (
          <span className="rounded-full bg-secondary/40 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            Arrived at Destination
          </span>
        );
      case "delivered":
        return (
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
            Delivered &amp; Verified
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
            <Truck className="size-4 text-primary" />
            <span>Active Rescue Orders &amp; Delivery Handshakes</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Live volunteer dispatch and physical verification codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LiveStatusIndicator
            lastUpdated={lastUpdated}
            timeAgoText={timeAgoText}
            isStale={isStale}
            isError={isError}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            label="Live Sync"
          />

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh Orders"
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/30"
          >
            <RefreshCw className={`size-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="flex min-h-[140px] items-center justify-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-4 text-primary" />
          <span>Loading rescue orders&hellip;</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No rescue orders in progress currently.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {o.listingTitle} ({o.allocatedPortions} Portions)
                  </span>
                  {getStatusBadge(o.status)}
                </div>

                <div className="text-xs text-muted-foreground">
                  {role === "donor" ? (
                    <>Destination: <strong>{o.receiverOrganisation}</strong></>
                  ) : (
                    <>From: <strong>{o.donorOrganisation}</strong> ({o.donorLocation})</>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3 text-muted-foreground" />
                  <span>Pickup Deadline: {new Date(o.pickupDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>

              {/* OTP Display Box */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-col items-center sm:items-end text-center sm:text-right shrink-0">
                {role === "donor" && o.pickupOtp ? (
                  <>
                    <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                      <KeyRound className="size-3" />
                      Pickup Verification OTP
                    </span>
                    <div className="font-mono text-xl font-bold tracking-widest text-foreground">
                      {o.pickupOtp}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Share with volunteer upon collection
                    </span>
                  </>
                ) : role === "receiver" && o.deliveryOtp ? (
                  <>
                    <span className="text-[11px] font-semibold text-secondary-foreground flex items-center gap-1">
                      <KeyRound className="size-3" />
                      Delivery Confirmation OTP
                    </span>
                    <div className="font-mono text-xl font-bold tracking-widest text-foreground">
                      {o.deliveryOtp}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Share with volunteer upon delivery
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">
                    OTP Managed Securely
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
