import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserNotifications } from "@/lib/notifications/service";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 30), 100);
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const data = await getUserNotifications(user.id, {
      limit,
      offset,
      unreadOnly,
    });

    return apiSuccess(data);
  } catch (error) {
    console.error("[GET /api/notifications] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch notifications", 500);
  }
}
