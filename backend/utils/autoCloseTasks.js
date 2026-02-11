const cron = require("node-cron");
const Task = require("../db/task");

const autoCloseTasksJob = () => {

  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      const result = await Task.updateMany(
        {
          end_time: { $lt: now },
          status: { $ne: "closed" }
        },
        {
          $set: {
            status: "closed",
            closed_at: now
          }
        }
      );

      console.log(`[CRON] Checked at ${now}`);

      if (result.modifiedCount > 0) {
        console.log(`[CRON] Closed ${result.modifiedCount} expired tasks`);
      }

    } catch (err) {
      console.error("[CRON] Auto close task error:", err);
    }

  }, {
    timezone: "Asia/Kolkata"
  });
};

module.exports = autoCloseTasksJob;
