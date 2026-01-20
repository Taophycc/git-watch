import axios from "axios";

export const sendDiscordMessage = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(" DISCORD_WEBHOOK_URL is missing in .env");
    return;
  }

  try {
    await axios.post(webhookUrl, {
      content: message,
    });
    console.log("-> Discord notification sent.");
  } catch (error) {
    console.error(` Error sending Discord notification: ${error}`);
  }
};
