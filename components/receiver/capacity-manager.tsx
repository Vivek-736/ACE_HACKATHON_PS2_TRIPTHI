"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit3, Settings, ShieldCheck, Users } from "lucide-react";
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
import type { ReceiverProfile } from "@/db/schema/requests";

interface CapacityManagerProps {
  profile: ReceiverProfile | null;
  onUpdateSuccess?: () => void;
}

export function CapacityManager({ profile, onUpdateSuccess }: CapacityManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [dailyCapacity, setDailyCapacity] = useState<number>(
    profile?.dailyCapacityPortions ?? 150
  );
  const [currentCapacity, setCurrentCapacity] = useState<number>(
    profile?.currentCapacityPortions ?? 150
  );
  const [dietaryPreferences, setDietaryPreferences] = useState<string>(
    profile?.dietaryPreferences ?? "Vegetarian, Cooked Meals, Bakery, Produce"
  );
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(
    profile?.serviceRadiusKm ?? 10
  );
  const [operatingHours, setOperatingHours] = useState<string>(
    profile?.operatingHours ?? "08:30 - 22:00"
  );

  const daily = profile?.dailyCapacityPortions ?? 150;
  const current = profile?.currentCapacityPortions ?? 150;
  const utilizationPct = Math.round(((daily - current) / Math.max(1, daily)) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/receiver/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyCapacityPortions: Number(dailyCapacity),
          currentCapacityPortions: Number(currentCapacity),
          dietaryPreferences,
          serviceRadiusKm: Number(serviceRadiusKm),
          operatingHours,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || "Failed to update receiver profile");
      }

      setSuccessMsg("Capacity updated successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
        router.refresh();
        onUpdateSuccess?.();
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error saving receiver profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              Community Kitchen Capacity
            </h3>
            <span className="rounded-full bg-secondary/30 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              Active Need
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Enforces limits on incoming surplus food reservations to prevent spoilage.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className={`${buttonVariants({
              variant: "outline",
              size: "sm",
            })} gap-1.5 self-start sm:self-auto`}
          >
            <Edit3 className="size-3.5" />
            <span>Update Capacity</span>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Update Capacity &amp; Food Preferences
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set how many portions your shelter can distribute safely today.
              </DialogDescription>
            </DialogHeader>

            {errorMsg && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-semibold text-primary">
                <CheckCircle2 className="size-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Daily Capacity (Portions) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20000"
                    required
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(Number(e.target.value))}
                    className="w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Available Today *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={dailyCapacity}
                    required
                    value={currentCapacity}
                    onChange={(e) => setCurrentCapacity(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Dietary Preferences &amp; Accepted Foods
                </label>
                <input
                  type="text"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g. Vegetarian only, Rice, Dal, Chapati, Fresh Produce"
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g. 09:00 - 22:00"
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
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
                      <span>Saving&hellip;</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Bar Visualizing Utilization */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Available to receive:{" "}
            <strong className="text-foreground">{current} portions</strong>
          </span>
          <span>
            Daily Max: <strong>{daily} portions</strong>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.max(5, Math.min(100, (current / Math.max(1, daily)) * 100))}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-border pt-3">
        <div>
          <strong>Dietary:</strong> {profile?.dietaryPreferences || "Vegetarian, Cooked Meals"}
        </div>
        <div>
          <strong>Radius:</strong> {profile?.serviceRadiusKm || 10} km
        </div>
        <div>
          <strong>Hours:</strong> {profile?.operatingHours || "09:00 - 22:00"}
        </div>
      </div>
    </div>
  );
}
