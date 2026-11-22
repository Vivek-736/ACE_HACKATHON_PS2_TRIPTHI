import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users, VERIFICATION_STATUSES, VerificationStatus } from "@/db/schema/users";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Access denied. Platform Admin authorization required.",
        403
      );
    }

    const { id } = await params;
    const body = await req.json();
    const status = body?.status as VerificationStatus;

    if (!status || !VERIFICATION_STATUSES.includes(status)) {
      return apiError(
        "INVALID_STATUS",
        `Invalid status. Must be one of: ${VERIFICATION_STATUSES.join(", ")}`,
        400
      );
    }

    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!targetUser) {
      return apiError("NOT_FOUND", "Organisation or user not found", 404);
    }

    const [updated] = await db
      .update(users)
      .set({
        verificationStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return apiSuccess({
      id: updated.id,
      organisationName: updated.organisationName || updated.displayName,
      verificationStatus: updated.verificationStatus,
    });
  } catch (err) {
    console.error("Failed to update organisation verification status:", err);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while updating verification",
      500
    );
  }
}
