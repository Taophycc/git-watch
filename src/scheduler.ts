import cron from "node-cron";
import {
  generateWeeklyChangelog,
  generateCodeAudit,
} from "./services/aiService";
import { sendDiscordMessage } from "./services/discordService";

const runReportingSuite = async () => {
  console.log(" Starting Weekly Reporting Suite...");

  try {
    const summary = await generateWeeklyChangelog();
    if (summary) {
      await sendDiscordMessage("📢 **Weekly Changelog**\n" + summary);
      console.log("✅ Weekly summary delivered to Discord.");
    } else {
      console.log("ℹ No summary generated (likely no commits).");
    }

    const audit = await generateCodeAudit();
    if (audit) {
      await sendDiscordMessage("🕵️ **Weekly Code Audit**\n" + audit);
      console.log("✅ Code audit delivered to Discord.");
    }
  } catch (error) {
    console.error("❌ Critical Error in Scheduler Suite:", error);
  }
};

export const startScheduler = () => {
  console.log("⏰ Scheduler initialized for Sundays at 9:00 AM.");

  cron.schedule("0 9 * * 0", runReportingSuite);

  runReportingSuite();
};
