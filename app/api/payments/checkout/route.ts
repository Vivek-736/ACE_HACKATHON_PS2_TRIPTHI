import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createCheckoutSession, PaymentPurpose } from "@/lib/payments/service";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required to checkout", 401);
    }

    const body = await req.json();
    const purpose = body?.purpose as PaymentPurpose;

    if (!purpose) {
      return apiError("INVALID_PAYLOAD", "Missing purpose field", 400);
    }

    const session = await createCheckoutSession({
      userId: user.id,
      purpose,
      organisationName: user.organisationName || user.displayName || undefined,
      notes: body?.notes,
    });

    return apiSuccess(session, 201);
  } catch (err) {
    console.error("Checkout initiation error:", err);
    return apiError(
      "SERVER_ERROR",
      err instanceof Error ? err.message : "Failed to initiate payment checkout",
      500
    );
  }
}
