import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { calculateImpactSummary } from "@/lib/impact/engine";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope"); // "mine" or "global"

    let options = {};
    if (scope === "mine" && user) {
      if (user.role === "donor") {
        options = { donorId: user.id };
      } else if (user.role === "receiver") {
        options = { receiverId: user.id };
      } else if (user.role === "volunteer") {
        options = { volunteerId: user.id };
      }
    }

    const summary = await calculateImpactSummary(options);
    return apiSuccess(summary);
  } catch (err) {
    console.error("Failed to generate impact summary:", err);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while calculating impact metrics",
      500
    );
  }
}
