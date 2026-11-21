"use client";

import { useState } from "react";
import {
  Clock,
  Flame,
  Info,
  MapPin,
  PlusCircle,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HYDERABAD_DEMO_LOCATIONS } from "@/lib/constants/demo-locations";
import {
  ALLERGEN_OPTIONS,
  CATEGORY_PRESETS,
  DIET_PRESETS,
  FOOD_SAFETY_SHORT_NOTICE,
  STORAGE_PRESETS,
} from "@/lib/constants/food-safety";
import type { FoodCategory, DietType, StorageInstruction } from "@/db/schema/listings";

interface QuickPostDialogProps {
  onSuccess?: () => void;
  triggerButtonText?: string;
}

export function QuickPostDialog({
  onSuccess,
  triggerButtonText = "Post Surplus Food",
}: QuickPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State with sensible 60-second quick defaults
  const [title, setTitle] = useState("Vegetable Biryani & Dal Makhani");
  const [foodCategory, setFoodCategory] = useState<FoodCategory>("cooked_meals");
  const [dietType, setDietType] = useState<DietType>("vegetarian");
  const [portions, setPortions] = useState<number>(45);
  const [weightKg, setWeightKg] = useState<string>("18.5");
  const [selectedLocationId, setSelectedLocationId] = useState(
    HYDERABAD_DEMO_LOCATIONS[0].id
  );
  const [storage, setStorage] = useState<StorageInstruction>("hot_holding");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(["dairy"]);
  const [pickupHoursAhead, setPickupHoursAhead] = useState<number>(3);
  const [prepMinutesAgo, setPrepMinutesAgo] = useState<number>(45);
  const [handlingNotes, setHandlingNotes] = useState(
    "Freshly cooked for lunch catering. Packed in stainless-steel thermal containers."
  );

  const selectedLocation =
    HYDERABAD_DEMO_LOCATIONS.find((loc) => loc.id === selectedLocationId) ||
    HYDERABAD_DEMO_LOCATIONS[0];

  const quickPresets = [
    {
      label: "Biryani & Curry",
      title: "Vegetable Biryani & Dal Makhani",
      category: "cooked_meals" as FoodCategory,
      diet: "vegetarian" as DietType,
      portions: 50,
      weight: "20.0",
      storage: "hot_holding" as StorageInstruction,
      allergens: ["dairy"],
      notes: "Steam holding at 65°C. Packed cleanly in insulated containers.",
    },
    {
      label: "Rice & Dal",
      title: "Steamed Rice, Sambar & Mixed Curry",
      category: "cooked_meals" as FoodCategory,
      diet: "vegetarian" as DietType,
      portions: 40,
      weight: "16.0",
      storage: "hot_holding" as StorageInstruction,
      allergens: ["none"],
      notes: "Fresh hostel canteen surplus. Hot and packed.",
    },
    {
      label: "Fresh Roti / Chapatis",
      title: "Fresh Whole Wheat Chapatis & Sabzi",
      category: "cooked_meals" as FoodCategory,
      diet: "vegan" as DietType,
      portions: 60,
      weight: "12.0",
      storage: "room_temperature" as StorageInstruction,
      allergens: ["gluten"],
      notes: "Wrapped in foil bundles of 5, ready for immediate pickup.",
    },
    {
      label: "Bakery Loaves & Buns",
      title: "Artisan Loaves, Buns & Tea Pastries",
      category: "bakery" as FoodCategory,
      diet: "vegetarian" as DietType,
      portions: 30,
      weight: "9.0",
      storage: "room_temperature" as StorageInstruction,
      allergens: ["gluten", "dairy"],
      notes: "Freshly baked today morning. Sealed bakery packaging.",
    },
  ];

  const applyPreset = (preset: (typeof quickPresets)[number]) => {
    setTitle(preset.title);
    setFoodCategory(preset.category);
    setDietType(preset.diet);
    setPortions(preset.portions);
    setWeightKg(preset.weight);
    setStorage(preset.storage);
    setSelectedAllergens(preset.allergens);
    setHandlingNotes(preset.notes);
  };

  const toggleAllergen = (id: string) => {
    if (id === "none") {
      setSelectedAllergens(["none"]);
      return;
    }
    const filtered = selectedAllergens.filter((a) => a !== "none");
    if (filtered.includes(id)) {
      const next = filtered.filter((a) => a !== id);
      setSelectedAllergens(next.length ? next : ["none"]);
    } else {
      setSelectedAllergens([...filtered, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const now = Date.now();
      const preparedAt = new Date(now - prepMinutesAgo * 60 * 1000).toISOString();
      const pickupBy = new Date(now + pickupHoursAhead * 60 * 60 * 1000).toISOString();

      const allergenStr =
        selectedAllergens.length > 0 ? selectedAllergens.join(", ") : "none";

      const payload = {
        title,
        foodCategory,
        dietType,
        quantityPortions: Number(portions),
        weightKg: weightKg ? Number(weightKg) : null,
        preparedAt,
        pickupBy,
        storageInstructions: storage,
        allergenInfo: allergenStr,
        handlingNotes: handlingNotes || null,
        locationName: selectedLocation.name,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json?.error?.message || "Failed to publish surplus food listing"
        );
      }

      setOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong posting listing"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={`${buttonVariants({ size: "default" })} gap-1.5 font-medium`}
      >
        <PlusCircle className="size-4" />
        <span>{triggerButtonText}</span>
        <span className="ml-1 rounded-sm bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          &lt; 60s
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Utensils className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Post Surplus Food
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Publish fresh surplus in under 60 seconds. Nearby receivers and volunteers match instantly.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 1-Click Quick Fill Presets */}
        <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>1-Click Quick Fill Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {preset.label} ({preset.portions} portions)
              </button>
            ))}
          </div>
        </div>

        {/* Non-negotiable Food Safety Notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="leading-relaxed">
            <strong>Food Safety Notice:</strong> {FOOD_SAFETY_SHORT_NOTICE}
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Food Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vegetable Biryani, Paneer Butter Masala"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Category *
              </label>
              <select
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Dietary Type *
              </label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as DietType)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {DIET_PRESETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Weight */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Meal Portions *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={portions}
                  onChange={(e) => setPortions(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <div className="flex gap-1">
                  {[25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPortions(num)}
                      className="rounded border border-border bg-muted/40 px-2 py-1 text-xs hover:border-primary"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Estimated Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 15.0"
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-foreground">
                <Clock className="size-3 text-muted-foreground" />
                Prepared
              </label>
              <select
                value={prepMinutesAgo}
                onChange={(e) => setPrepMinutesAgo(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value={15}>Just prepared (~15 mins ago)</option>
                <option value={45}>45 minutes ago</option>
                <option value={90}>1.5 hours ago</option>
                <option value={180}>3 hours ago</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-foreground">
                <Flame className="size-3 text-destructive" />
                Pickup Window Deadline *
              </label>
              <select
                value={pickupHoursAhead}
                onChange={(e) => setPickupHoursAhead(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value={2}>Within 2 hours (High Urgency)</option>
                <option value={3}>Within 3 hours (Recommended)</option>
                <option value={5}>Within 5 hours</option>
                <option value={8}>Within 8 hours / Tonight</option>
              </select>
            </div>
          </div>

          {/* Storage & Allergens */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Storage Condition *
            </label>
            <select
              value={storage}
              onChange={(e) =>
                setStorage(e.target.value as StorageInstruction)
              }
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {STORAGE_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Declared Allergens * (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((item) => {
                const isSelected = selectedAllergens.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAllergen(item.id)}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pickup Demo Location */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-medium text-foreground">
              <MapPin className="size-3 text-primary" />
              Pickup Location (Safe Demo Point) *
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
            <p className="text-[11px] text-muted-foreground">
              Synthetic demo coordinates: {selectedLocation.latitude},{" "}
              {selectedLocation.longitude} (No real personal addresses stored).
            </p>
          </div>

          {/* Handling Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Handling &amp; Packaging Notes
            </label>
            <input
              type="text"
              value={handlingNotes}
              onChange={(e) => setHandlingNotes(e.target.value)}
              placeholder="e.g. Packed in thermal carriers; bring clean crates"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
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
                  <span>Publishing Listing&hellip;</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Publish Surplus Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
