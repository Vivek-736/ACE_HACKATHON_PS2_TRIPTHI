import { NextRequest } from "next/server";
import { eq, or, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(_req: NextRequest) {
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

    // Fetch organisations (donors and receivers)
    const orgs = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        organisationName: users.organisationName,
        role: users.role,
        verificationStatus: users.verificationStatus,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(or(eq(users.role, "donor"), eq(users.role, "receiver")))
      .orderBy(desc(users.createdAt));

    return apiSuccess(orgs);
  } catch (err) {
    console.error("Failed to fetch organisations:", err);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while loading organisations",
      500
    );
  }
}
