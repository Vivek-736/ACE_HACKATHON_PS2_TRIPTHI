import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { confirmPayment } from "@/lib/payments/service";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const body = await req.json();
    const { paymentRecordId, razorpayPaymentId, razorpaySignature } = body;

    if (!paymentRecordId) {
      return apiError("INVALID_PAYLOAD", "Missing paymentRecordId", 400);
    }

    const updated = await confirmPayment({
      paymentRecordId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return apiSuccess({
      message: "Payment successfully verified and confirmed",
      record: updated,
    });
  } catch (err) {
    console.error("Payment confirmation error:", err);
    return apiError(
      "SERVER_ERROR",
      err instanceof Error ? err.message : "Payment confirmation failed",
      500
    );
  }
}
