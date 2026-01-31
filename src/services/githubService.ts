import { query } from "../db/connection";
import { sendDiscordMessage } from "./discordService";

async function saveEvent(deliveryId: string, eventType: string, payload: any) {
  const sql = `INSERT INTO github_events (github_delivery_id, event_type, payload) VALUES ($1, $2, $3) ON CONFLICT (github_delivery_id) DO NOTHING`;
  await query(sql, [deliveryId, eventType, payload]);
}

export const getRecentEvents = async (limit: number = 10, type?: string) => {
  let sql = `SELECT * FROM github_events`;
  const params: any[] = [];

  if (type) {
    sql += ` WHERE event_type = $${params.length + 1}`;
    params.push(type);
  }

  sql += ` ORDER by created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const result = await query(sql, params);
  return result.rows;
};

export const handlePushEvent = async (payload: any, deliveryId: string) => {
  const pusher = payload.pusher?.name || "unknown";
  const ref = payload.ref || "unknown ref";
  const commits = payload.commits || [];

  await saveEvent(deliveryId, "push", payload);

  const message = `-> Push event by ${pusher} to ${ref} with ${commits.length} commit(s).`;
  sendDiscordMessage(message);
  console.log(message);

  commits.forEach((commit: any) => {
    console.log(
      `   - ${commit.id.substring(0, 7)}: ${commit.message} (by ${commit.author.name})`,
    );
  });
};

export const handleIssueEvent = async (payload: any, deliveryId: string) => {
  const action = payload.action || "unknown action";
  const issueNumber = payload.issue?.number || "unknown";
  const issueTitle = payload.issue?.title || "no title";
  const sender = payload.sender?.login || "unknown";

  await saveEvent(deliveryId, "issues", payload);
  const message = `-> Issue #${issueNumber} "${issueTitle}" ${action} by ${sender}.`;
  console.log(message);
  sendDiscordMessage(message);
};

export const handleStarEvent = async (payload: any, deliveryId: string) => {
  const sender = payload.sender.login;
  const action = payload.action;
  const starCount = payload.repository.stargazers_count;
  const repoName = payload.repository.full_name;

  await saveEvent(deliveryId, "star", payload);

  const status = action === "created" ? "New Star" : "Unstarred";
  const message = ` -> ${status} from ${sender}! Total Stars: ${starCount}`;

  console.log(message);
  sendDiscordMessage(message);
};

export const handleWatchEvent = async (payload: any, deliveryId: string) => {
  const sender = payload.sender.login;
  const action = payload.action;
  const repoName = payload.repository.full_name;
  await saveEvent(deliveryId, "watch", payload);

  const message = `-> Repository ${repoName} was ${action} by ${sender}.`;

  console.log(message);
  sendDiscordMessage(message);
};
