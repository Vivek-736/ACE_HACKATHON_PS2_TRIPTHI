import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiSuccess } from "@/lib/api/response";
import { markAllNotificationsAsRead } from "@/lib/notifications/service";

export async function POST(_req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const count = await markAllNotificationsAsRead(user.id);

    return apiSuccess({ markedCount: count });
  } catch (error) {
    console.error("[POST /api/notifications/mark-all-read] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to mark all as read", 500);
  }
}
