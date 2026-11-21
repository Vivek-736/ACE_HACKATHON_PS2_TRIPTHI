import { z } from "zod";
import {
  FOOD_CATEGORIES,
  DIET_TYPES,
  STORAGE_INSTRUCTIONS,
} from "@/db/schema/listings";

export const createListingSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title cannot exceed 120 characters"),
    foodCategory: z.enum(FOOD_CATEGORIES, {
      error: "Please select a valid food category",
    }),
    dietType: z.enum(DIET_TYPES, {
      error: "Please select a valid dietary type",
    }),
    quantityPortions: z.coerce
      .number()
      .int("Portions must be a whole number")
      .min(1, "Quantity must be at least 1 portion")
      .max(10000, "Quantity cannot exceed 10,000 portions"),
    weightKg: z.coerce
      .number()
      .positive("Weight must be positive")
      .max(5000, "Weight cannot exceed 5000 kg")
      .optional()
      .nullable(),
    preparedAt: z.coerce.date({
      error: "Please specify a valid preparation time",
    }),
    pickupBy: z.coerce.date({
      error: "Please specify a valid pickup deadline",
    }),
    storageInstructions: z.enum(STORAGE_INSTRUCTIONS, {
      error: "Please select valid storage instructions",
    }),
    allergenInfo: z
      .string()
      .min(1, "Allergen information is required (select 'none' if none)"),
    handlingNotes: z.string().max(500).optional().nullable(),
    locationName: z.string().min(2, "Location name is required"),
    latitude: z.coerce
      .number()
      .min(-90)
      .max(90, "Latitude must be between -90 and 90"),
    longitude: z.coerce
      .number()
      .min(-180)
      .max(180, "Longitude must be between -180 and 180"),
  })
  .refine(
    (data) => {
      // pickupBy must be strictly in the future
      return data.pickupBy.getTime() > Date.now();
    },
    {
      message: "Pickup deadline must be in the future",
      path: ["pickupBy"],
    }
  )
  .refine(
    (data) => {
      // preparedAt cannot be after pickupBy
      return data.preparedAt.getTime() <= data.pickupBy.getTime();
    },
    {
      message: "Preparation time cannot be after the pickup deadline",
      path: ["preparedAt"],
    }
  );

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  quantityPortions: z.coerce.number().int().min(1).max(10000).optional(),
  handlingNotes: z.string().max(500).optional().nullable(),
  pickupBy: z.coerce.date().optional(),
  status: z
    .enum([
      "available",
      "reserved",
      "in_rescue",
      "completed",
      "cancelled",
      "expired",
    ])
    .optional(),
});

export type UpdateListingInput = z.infer<typeof updateListingSchema>;
