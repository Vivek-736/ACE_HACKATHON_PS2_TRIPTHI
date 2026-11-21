"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  HandHeart,
  Info,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Utensils,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CATEGORY_PRESETS,
  DIET_PRESETS,
  FOOD_SAFETY_SHORT_NOTICE,
} from "@/lib/constants/food-safety";
import type { FoodListing } from "@/db/schema/listings";
import type { ReceiverProfile } from "@/db/schema/requests";

interface DiscoverFoodViewProps {
  receiverProfile?: ReceiverProfile | null;
  onReservationSuccess?: () => void;
}

export function DiscoverFoodView({
  receiverProfile,
  onReservationSuccess,
}: DiscoverFoodViewProps) {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");

  // Reservation Dialog State
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [requestedPortions, setRequestedPortions] = useState<number>(30);
  const [reserveNotes, setReserveNotes] = useState("");
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      let url = "/api/listings?onlyActive=true&status=available";
      if (categoryFilter !== "all") url += `&category=${categoryFilter}`;
      if (dietFilter !== "all") url += `&diet=${dietFilter}`;

      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.data) {
        setListings(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch available listings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [categoryFilter, dietFilter]);

  const handleOpenReserve = (listing: FoodListing) => {
    setSelectedListing(listing);
    // Default requested portions to whichever is smaller: available portions or receiver's capacity or 30
    const maxPoss = Math.min(
      listing.remainingPortions,
      receiverProfile?.currentCapacityPortions ?? listing.remainingPortions
    );
    setRequestedPortions(maxPoss > 0 ? maxPoss : listing.remainingPortions);
    setReserveNotes("");
    setReserveError(null);
    setReserveSuccess(null);
    setReserveModalOpen(true);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setReserving(true);
    setReserveError(null);

    try {
      const res = await fetch(`/api/listings/${selectedListing.id}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portionsRequested: Number(requestedPortions),
          notes: reserveNotes || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to reserve surplus food");
      }

      setReserveSuccess("Reservation confirmed! Volunteer matching has been initiated.");
      setTimeout(() => {
        setReserveModalOpen(false);
        fetchListings();
        if (onReservationSuccess) onReservationSuccess();
      }, 1500);
    } catch (err: unknown) {
      setReserveError(
        err instanceof Error ? err.message : "Error reserving listing"
      );
    } finally {
      setReserving(false);
    }
  };

  const formatRemainingTime = (pickupBy: Date | string) => {
    const diffMs = new Date(pickupBy).getTime() - Date.now();
    if (diffMs <= 0) return "Expired";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m window`;
    return `${mins}m window`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Filter className="size-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORY_PRESETS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value)}
            className="rounded-md border border-input bg-card px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Dietary Types</option>
            {DIET_PRESETS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            fetchListings();
          }}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/30 self-end sm:self-auto"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh Live</span>
        </button>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="flex min-h-[220px] items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs text-muted-foreground">
          <Spinner className="size-5 text-primary" />
          <span>Searching for available surplus food nearby&hellip;</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
          <div className="rounded-full bg-secondary/30 p-3 text-secondary-foreground">
            <Utensils className="size-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">
            No Surplus Food Currently Available in this Category
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try resetting your category or dietary filters, or post a custom food request to notify donors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {listings.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      By: {item.organisationName || "Verified Food Donor"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {item.remainingPortions} Portions
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-primary" />
                    <span>
                      Pickup deadline:{" "}
                      <strong className="text-foreground">
                        {formatRemainingTime(item.pickupBy)}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    <span className="truncate">{item.locationName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground capitalize">
                      {item.dietType.replace("_", " ")}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground capitalize">
                      {item.storageInstructions.replace("_", " ")}
                    </span>
                    <span className="rounded bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      Allergens: {item.allergenInfo}
                    </span>
                  </div>

                  {item.handlingNotes && (
                    <p className="pt-1 text-[11px] italic text-muted-foreground">
                      &ldquo;{item.handlingNotes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] text-muted-foreground">
                  Zero cost to receivers
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenReserve(item)}
                  className={`${buttonVariants({ size: "sm" })} gap-1.5`}
                >
                  <HandHeart className="size-3.5" />
                  <span>Reserve Surplus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Dialog Modal */}
      {selectedListing && (
        <Dialog open={reserveModalOpen} onOpenChange={setReserveModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                  <HandHeart className="size-5" />
                </span>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Reserve Surplus Food
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Confirm portions required by your community kitchen.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Food Safety Notice */}
            <div className="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="leading-relaxed">{FOOD_SAFETY_SHORT_NOTICE}</p>
            </div>

            {reserveError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {reserveError}
              </div>
            )}

            {reserveSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-semibold text-primary">
                <CheckCircle2 className="size-4" />
                <span>{reserveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1 text-xs">
                <div className="font-semibold text-foreground">
                  {selectedListing.title}
                </div>
                <div className="text-muted-foreground">
                  Available:{" "}
                  <strong>{selectedListing.remainingPortions} portions</strong>
                </div>
                <div className="text-muted-foreground">
                  Storage: {selectedListing.storageInstructions.replace("_", " ")} &bull; Allergens: {selectedListing.allergenInfo}
                </div>
                {receiverProfile && (
                  <div className="text-muted-foreground pt-1 border-t border-border mt-1">
                    Your Available Capacity:{" "}
                    <strong>{receiverProfile.currentCapacityPortions} portions</strong>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Portions to Request * (Max {selectedListing.remainingPortions})
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedListing.remainingPortions}
                  required
                  value={requestedPortions}
                  onChange={(e) => setRequestedPortions(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Receiver Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  value={reserveNotes}
                  onChange={(e) => setReserveNotes(e.target.value)}
                  placeholder="e.g. Please ring rear gate bell; volunteer can park in courtyard"
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReserveModalOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reserving || !!reserveSuccess}
                  className={`${buttonVariants({ size: "default" })} gap-1.5`}
                >
                  {reserving ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Reserving&hellip;</span>
                    </>
                  ) : (
                    <span>Confirm Reservation</span>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
