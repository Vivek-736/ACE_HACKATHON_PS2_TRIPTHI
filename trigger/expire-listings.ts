import { logger, task } from "@trigger.dev/sdk";
import { processListingExpiry } from "../lib/jobs/expiry";

export const expireListingsTask = task({
  id: "expire-listings",
  maxDuration: 180, // 3 minutes compute max
  run: async (payload: { triggeredBy?: string } = {}) => {
    logger.info("Executing Tripti Listing Expiry Sweep", { payload });

    const result = await processListingExpiry();

    logger.info("Listing Expiry Sweep Completed", {
      expiredCount: result.expiredCount,
      expiredListingIds: result.expiredListingIds,
    });

    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    };
  },
});
