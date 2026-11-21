import { NextRequest } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { foodListings, type FoodCategory, type DietType, type ListingStatus } from "@/db/schema/listings";
import { createListingSchema } from "@/lib/validations/listing";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (user.role !== "donor" && user.role !== "admin") {
      return apiError(
        "FORBIDDEN",
        "Only donors and administrators can create surplus food listings",
        403
      );
    }

    const body = await req.json();
    const parsed = createListingSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return apiError(
        "VALIDATION_ERROR",
        "Please check the submitted listing fields",
        422,
        fieldErrors
      );
    }

    const {
      title,
      foodCategory,
      dietType,
      quantityPortions,
      weightKg,
      preparedAt,
      pickupBy,
      storageInstructions,
      allergenInfo,
      handlingNotes,
      locationName,
      latitude,
      longitude,
    } = parsed.data;

    const orgName =
      user.organisationName ||
      user.displayName ||
      `${user.firstName || "Anonymous"} Donor`;

    const inserted = await db
      .insert(foodListings)
      .values({
        donorId: user.id,
        organisationName: orgName,
        title,
        foodCategory,
        dietType,
        quantityPortions,
        remainingPortions: quantityPortions,
        weightKg: weightKg ? weightKg.toString() : null,
        preparedAt,
        pickupBy,
        storageInstructions,
        allergenInfo,
        handlingNotes: handlingNotes || null,
        locationName,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        status: "available",
      })
      .returning();

    return apiSuccess(inserted[0], 201);
  } catch (error) {
    console.error("Failed to create food listing:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while publishing the surplus food listing",
      500
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const foodCategory = searchParams.get("category");
    const dietType = searchParams.get("diet");
    const donorId = searchParams.get("donorId");
    const onlyActive = searchParams.get("onlyActive") !== "false";

    const conditions = [];

    if (status && status !== "all") {
      conditions.push(eq(foodListings.status, status as ListingStatus));
    } else if (onlyActive) {
      // By default show available listings
      conditions.push(eq(foodListings.status, "available"));
    }

    if (onlyActive) {
      conditions.push(gt(foodListings.pickupBy, new Date()));
    }

    if (foodCategory && foodCategory !== "all") {
      conditions.push(
        eq(foodListings.foodCategory, foodCategory as FoodCategory)
      );
    }

    if (dietType && dietType !== "all") {
      conditions.push(eq(foodListings.dietType, dietType as DietType));
    }

    if (donorId) {
      conditions.push(eq(foodListings.donorId, donorId));
    }

    const query = db
      .select()
      .from(foodListings)
      .orderBy(desc(foodListings.createdAt));

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return apiSuccess(rows);
  } catch (error) {
    console.error("Failed to fetch food listings:", error);
    return apiError(
      "SERVER_ERROR",
      "An unexpected error occurred while retrieving food listings",
      500
    );
  }
}
