import axios from "axios";

export const sendDiscordMessage = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error(" DISCORD_WEBHOOK_URL is missing in .env");
    return;
  }

  try {
    const MAX_LENGTH = 1900;
    const chunks = [];

    for (let i = 0; i < message.length; i += MAX_LENGTH) {
      chunks.push(message.substring(i, i + MAX_LENGTH));
    }

    for (const chunk of chunks) {
      await axios.post(webhookUrl, {
        content: chunk,
      });
    }

    console.log(`-> Sent ${chunks.length} message(s) to Discord.`);
  } catch (error: any) {
    console.error(
      `Error sending Discord notification: ${error.response?.data?.message || error.message}`,
    );
  }
};
