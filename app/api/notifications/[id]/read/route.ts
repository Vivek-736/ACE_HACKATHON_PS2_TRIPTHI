import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { apiError, apiSuccess } from "@/lib/api/response";
import { markNotificationAsRead } from "@/lib/notifications/service";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    const { id } = await params;
    if (!id) {
      return apiError("BAD_REQUEST", "Notification ID is required", 400);
    }

    const success = await markNotificationAsRead(id, user.id);

    if (!success) {
      return apiError("NOT_FOUND", "Notification not found or access denied", 404);
    }

    return apiSuccess({ id, read: true });
  } catch (error) {
    console.error("[PATCH /api/notifications/[id]/read] Error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update notification", 500);
  }
}
