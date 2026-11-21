import { z } from "zod";
import { ORDER_STATUSES } from "@/db/schema/orders";

export const createRescueOrderSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  receiverId: z.string().uuid("Invalid receiver ID"),
  volunteerId: z.string().uuid("Invalid volunteer ID").optional().nullable(),
  allocatedPortions: z.coerce
    .number()
    .int("Portions must be a whole number")
    .min(1, "Must allocate at least 1 portion"),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateRescueOrderInput = z.infer<typeof createRescueOrderSchema>;

export const orderActionSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
});

export type OrderActionInput = z.infer<typeof orderActionSchema>;

export const transitionOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUSES, {
      error: "Invalid target order status",
    }),
    otp: z.string().min(4, "OTP must be 4 digits").max(6).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    proofPhotoUrl: z.string().url("Invalid proof URL").optional().nullable(),
  })
  .refine(
    (data) => {
      // If transitioning to collected or delivered, OTP is mandatory
      if (data.status === "collected" || data.status === "delivered") {
        return !!data.otp && data.otp.trim().length > 0;
      }
      return true;
    },
    {
      message: "Handoff verification OTP is required for pickup collection and delivery confirmation",
      path: ["otp"],
    }
  );

export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>;
