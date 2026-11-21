import { NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodRequests, type RequestStatus } from "@/db/schema/requests";
import { createFoodRequestSchema } from "@/lib/validations/request";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "receiver" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only receiver community organisations can create food requests",
        403
      );
    }

    const body = await req.json();
    const parsed = createFoodRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError(
        "VALIDATION_ERROR",
        "Please check the submitted food request fields",
        422,
        fieldErrors
      );
    }

    const {
      title,
      requestedPortions,
      foodPreferences,
      dietaryConstraints,
      neededBy,
      preferredRadiusKm,
      locationName,
      latitude,
      longitude,
    } = parsed.data;

    const orgName =
      user.organisationName ||
      user.displayName ||
      `${user.firstName || "Anonymous"} Community Kitchen`;

    const inserted = await db
      .insert(foodRequests)
      .values({
        receiverId: user.id,
        organisationName: orgName,
        title,
        requestedPortions,
        foodPreferences,
        dietaryConstraints: dietaryConstraints || null,
        neededBy,
        preferredRadiusKm,
        locationName,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        status: "active",
      })
      .returning();

    return apiSuccess(inserted[0], 201);
  } catch (error) {
    console.error("Failed to create food request:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while creating the food request",
      500
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const receiverId = searchParams.get("receiverId");
    const onlyActive = searchParams.get("onlyActive") !== "false";

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(foodRequests.status, status as RequestStatus));
    } else if (onlyActive) {
      conditions.push(eq(foodRequests.status, "active"));
    }

    if (onlyActive) {
      conditions.push(gt(foodRequests.neededBy, new Date()));
    }

    if (receiverId) {
      conditions.push(eq(foodRequests.receiverId, receiverId));
    }

    const query = db
      .select()
      .from(foodRequests)
      .orderBy(desc(foodRequests.createdAt));

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return apiSuccess(rows);
  } catch (error) {
    console.error("Failed to fetch food requests:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while retrieving food requests",
      500
    );
  }
}
