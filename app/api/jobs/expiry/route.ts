import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/response";
import { processListingExpiry, processVolunteerReminders } from "@/lib/jobs/expiry";

export async function POST(req: NextRequest) {
  try {
    // Check authorization: Bearer token or Cron secret if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get("authorization");
      const passedKey = req.headers.get("x-cron-key") || (authHeader ? authHeader.replace("Bearer ", "") : null);
      if (passedKey !== cronSecret) {
        return apiError("UNAUTHORIZED", "Invalid cron key", 401);
      }
    }

    const expiryResults = await processListingExpiry();
    const reminderResults = await processVolunteerReminders();

    return apiSuccess({
      timestamp: new Date().toISOString(),
      expiry: expiryResults,
      reminders: reminderResults,
    });
  } catch (error: any) {
    console.error("[POST /api/jobs/expiry] Error:", error);
    return apiError("INTERNAL_ERROR", error?.message || "Job execution failed", 500);
  }
}

// Allow GET for easy cron testing and dashboard pings
export async function GET(req: NextRequest) {
  return POST(req);
}
