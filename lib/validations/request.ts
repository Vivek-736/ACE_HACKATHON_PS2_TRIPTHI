import { z } from "zod";

export const createFoodRequestSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title cannot exceed 120 characters"),
    requestedPortions: z.coerce
      .number()
      .int("Portions must be a whole number")
      .min(1, "Requested portions must be at least 1")
      .max(5000, "Requested portions cannot exceed 5,000"),
    foodPreferences: z
      .string()
      .min(2, "Please specify acceptable food types or dietary preferences"),
    dietaryConstraints: z.string().max(300).optional().nullable(),
    neededBy: z.coerce.date({
      error: "Please specify when the food is needed by",
    }),
    preferredRadiusKm: z.coerce.number().int().min(1).max(50).default(10),
    locationName: z.string().min(2, "Location is required"),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
  })
  .refine(
    (data) => {
      return data.neededBy.getTime() > Date.now();
    },
    {
      message: "Needed-by time must be in the future",
      path: ["neededBy"],
    }
  );

export type CreateFoodRequestInput = z.infer<typeof createFoodRequestSchema>;

export const reserveListingSchema = z.object({
  portionsRequested: z.coerce
    .number()
    .int("Portions must be a whole number")
    .min(1, "Must request at least 1 portion"),
  notes: z.string().max(400).optional().nullable(),
});

export type ReserveListingInput = z.infer<typeof reserveListingSchema>;

export const updateReceiverProfileSchema = z.object({
  dailyCapacityPortions: z.coerce
    .number()
    .int()
    .min(1, "Capacity must be at least 1 portion")
    .max(20000, "Capacity cannot exceed 20,000 portions"),
  currentCapacityPortions: z.coerce
    .number()
    .int()
    .min(0, "Current capacity cannot be negative")
    .max(20000),
  dietaryPreferences: z.string().max(500).optional().nullable(),
  serviceRadiusKm: z.coerce.number().int().min(1).max(50).default(10),
  operatingHours: z.string().max(200).optional().nullable(),
});

export type UpdateReceiverProfileInput = z.infer<
  typeof updateReceiverProfileSchema
>;
