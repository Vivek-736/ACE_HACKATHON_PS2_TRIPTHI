"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HYDERABAD_DEMO_LOCATIONS } from "@/lib/constants/demo-locations";

interface PostFoodRequestDialogProps {
  onSuccess?: () => void;
}

export function PostFoodRequestDialog({ onSuccess }: PostFoodRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("Seeking Cooked Dinner Meals for Shelter");
  const [requestedPortions, setRequestedPortions] = useState(50);
  const [foodPreferences, setFoodPreferences] = useState(
    "Cooked Meals, Dal, Roti, Rice, Fresh Curries"
  );
  const [dietaryConstraints, setDietaryConstraints] = useState(
    "Vegetarian preferred. No raw salads."
  );
  const [neededHoursAhead, setNeededHoursAhead] = useState(4);
  const [selectedLocationId, setSelectedLocationId] = useState(
    HYDERABAD_DEMO_LOCATIONS[0].id
  );

  const selectedLocation =
    HYDERABAD_DEMO_LOCATIONS.find((loc) => loc.id === selectedLocationId) ||
    HYDERABAD_DEMO_LOCATIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const neededBy = new Date(
        Date.now() + neededHoursAhead * 60 * 60 * 1000
      ).toISOString();

      const payload = {
        title,
        requestedPortions: Number(requestedPortions),
        foodPreferences,
        dietaryConstraints: dietaryConstraints || null,
        neededBy,
        preferredRadiusKm: 12,
        locationName: selectedLocation.name,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      const res = await fetch("/api/food-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to create food request");
      }

      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error creating food request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={`${buttonVariants({
          variant: "outline",
          size: "sm",
        })} gap-1.5`}
      >
        <PlusCircle className="size-3.5" />
        <span>Post Food Need</span>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-secondary/30 p-1.5 text-secondary-foreground">
              <Heart className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Post Community Food Need
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Inform nearby food donors of your community shelter&apos;s meal requirements.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking 50 meals for evening service"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Portions Required *
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                required
                value={requestedPortions}
                onChange={(e) => setRequestedPortions(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Needed Within *
              </label>
              <select
                value={neededHoursAhead}
                onChange={(e) => setNeededHoursAhead(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value={2}>Within 2 hours</option>
                <option value={4}>Within 4 hours</option>
                <option value={8}>Within 8 hours</option>
                <option value={12}>Today by end of day</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Food Preferences *
            </label>
            <input
              type="text"
              required
              value={foodPreferences}
              onChange={(e) => setFoodPreferences(e.target.value)}
              placeholder="e.g. Cooked rice, dal, chapatis, curries"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Dietary Constraints
            </label>
            <input
              type="text"
              value={dietaryConstraints}
              onChange={(e) => setDietaryConstraints(e.target.value)}
              placeholder="e.g. Vegetarian only, mild spices"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Delivery Center (Safe Demo Point) *
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {HYDERABAD_DEMO_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${buttonVariants({ size: "default" })} gap-1.5`}
            >
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  <span>Submitting&hellip;</span>
                </>
              ) : (
                <span>Post Food Need</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
