"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Flame,
  Info,
  MapPin,
  RefreshCw,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { QuickPostDialog } from "./quick-post-dialog";
import type { FoodListing } from "@/db/schema/listings";

interface DonorListingsTableProps {
  donorId?: string;
}

export function DonorListingsTable({ donorId }: DonorListingsTableProps) {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      const url = donorId
        ? `/api/listings?status=all&onlyActive=false&donorId=${donorId}`
        : `/api/listings?status=all&onlyActive=false`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setListings(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch donor listings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [donorId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this surplus food listing?")) {
      return;
    }
    setCancellingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/listings/${id}/cancel`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to cancel listing");
      }
      fetchListings();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Error cancelling listing"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string, pickupBy: Date | string) => {
    const isExpired = new Date(pickupBy).getTime() <= Date.now();
    const effectiveStatus = isExpired && status === "available" ? "expired" : status;

    switch (effectiveStatus) {
      case "available":
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            AVAILABLE
          </span>
        );
      case "reserved":
        return (
          <span className="inline-flex items-center rounded-full bg-secondary/30 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            RESERVED
          </span>
        );
      case "in_rescue":
        return (
          <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
            IN RESCUE
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
            COMPLETED
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
            CANCELLED
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            EXPIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const formatRemainingTime = (pickupBy: Date | string) => {
    const diffMs = new Date(pickupBy).getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            My Surplus Food Listings
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Live lifecycle: AVAILABLE &rarr; RESERVED &rarr; IN RESCUE &rarr; DELIVERED
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/30"
            title="Refresh listings"
          >
            <RefreshCw
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <QuickPostDialog onSuccess={fetchListings} triggerButtonText="Quick Post" />
        </div>
      </div>

      {actionError && (
        <div className="m-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-4 text-primary" />
          <span>Loading your listings&hellip;</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <UtensilsCrossed className="size-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No Surplus Food Posted Yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Have surplus prepared meals, bakery items, or groceries? Post a listing in under 60 seconds.
          </p>
          <div className="mt-4">
            <QuickPostDialog onSuccess={fetchListings} />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {listings.map((item) => {
            const isAvailable =
              item.status === "available" &&
              new Date(item.pickupBy).getTime() > Date.now();

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {item.title}
                    </span>
                    {getStatusBadge(item.status, item.pickupBy)}
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                      {item.dietType.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <strong>Portions:</strong> {item.remainingPortions} /{" "}
                      {item.quantityPortions} portions
                      {item.weightKg ? ` (~${item.weightKg} kg)` : ""}
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      <strong>Pickup Window:</strong>{" "}
                      <span
                        className={
                          isAvailable
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {formatRemainingTime(item.pickupBy)}
                      </span>
                    </div>

                    <div>
                      <strong>Storage:</strong>{" "}
                      <span className="capitalize">
                        {item.storageInstructions.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <strong>Allergens:</strong> {item.allergenInfo}
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-1">
                      <MapPin className="size-3 text-primary shrink-0" />
                      <span>{item.locationName}</span>
                    </div>
                  </div>

                  {item.handlingNotes && (
                    <p className="text-xs italic text-muted-foreground/90">
                      &ldquo;{item.handlingNotes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                  {item.status === "available" && (
                    <button
                      type="button"
                      disabled={cancellingId === item.id}
                      onClick={() => handleCancel(item.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      {cancellingId === item.id ? (
                        <Spinner className="size-3" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border bg-muted/20 p-4 text-[11px] text-muted-foreground">
        <span>
          * Food listings are automatically matched with eligible nearby NGOs and community kitchens.
          Platform does not certify food safety; donors must follow hygiene and storage requirements.
        </span>
      </div>
    </div>
  );
}
