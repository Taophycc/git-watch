import { sendDiscordMessage } from "./discordService";

export const handlePushEvent = (payload: any) => {
  const pusher = payload.pusher?.name || "unknown";
  const ref = payload.ref || "unknown ref";
  const commits = payload.commits || [];

  console.log(
    `-> Push by ${pusher} to ${ref} with ${commits.length} commit(s).`,
  );
  commits.forEach((commit: any) => {
    console.log(
      `   - ${commit.id.substring(0, 7)}: ${commit.message} (by ${commit.author.name})`,
    );
  });
};

export const handleIssueEvent = (payload: any) => {
  const action = payload.action || "unknown action";
  const issueNumber = payload.issue?.number || "unknown";
  const issueTitle = payload.issue?.title || "no title";
  const sender = payload.sender?.login || "unknown";

  console.log(
    `-> Issue #${issueNumber} "${issueTitle}" ${action} by ${sender}.`,
  );
};

export const handleStarEvent = (payload: any) => {
  const sender = payload.sender.login;
  const action = payload.action;
  const starCount = payload.repository.stargazers_count;
  const repoName = payload.repository.full_name;

  const status = action === "created" ? "New Star" : "Unstarred";
  const message = ` -> ${status} from ${sender}! Total Stars: ${starCount}`;

  console.log(message);
  sendDiscordMessage(message);
};
