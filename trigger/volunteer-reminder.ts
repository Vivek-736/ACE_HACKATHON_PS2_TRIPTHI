import { logger, task } from "@trigger.dev/sdk";
import { processVolunteerReminders } from "../lib/jobs/expiry";

export const volunteerRemindersTask = task({
  id: "volunteer-reminders",
  maxDuration: 180,
  run: async (payload: { triggeredBy?: string } = {}) => {
    logger.info("Executing Volunteer Dispatch Reminders Sweep", { payload });

    const result = await processVolunteerReminders();

    logger.info("Volunteer Reminders Sweep Completed", {
      remindedCount: result.remindedCount,
      orderIds: result.orderIds,
    });

    return {
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    };
  },
});
