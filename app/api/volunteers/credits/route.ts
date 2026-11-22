import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getVolunteerCreditStatement } from "@/lib/credits/service";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "volunteer" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Rescue Credits are reserved for registered volunteers",
        403
      );
    }

    const statement = await getVolunteerCreditStatement(user.id);
    return apiSuccess(statement);
  } catch (err) {
    console.error("Failed to retrieve volunteer credit statement:", err);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while loading credit statement",
      500
    );
  }
}
