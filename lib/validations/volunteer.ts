import { z } from "zod";
import { TRANSPORT_MODES, VOLUNTEER_AVAILABILITY } from "@/db/schema/volunteers";

export const updateVolunteerLocationSchema = z.object({
  locationName: z.string().min(2, "Location name is required"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  preferredRadiusKm: z.coerce.number().int().min(1).max(50).optional(),
  transportMode: z.enum(TRANSPORT_MODES).optional(),
});

export const updateVolunteerAvailabilitySchema = z.object({
  availabilityStatus: z.enum(VOLUNTEER_AVAILABILITY),
});
