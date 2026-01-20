import { Request, Response } from "express";

export const handleWebhook = (req: Request, res: Response) => {
  res.status(200).send("Event received");

  const eventType = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;
  const repoName = req.body.repository?.full_name || "unknown";

  console.log(`\n Processing ${eventType} from ${repoName}`);

  try {
    switch (eventType) {
      case "push":
        handlePush(req.body);
        break;
      case "issues":
        handleIssue(req.body);
        break;
      case "star":
        handleStar(req.body);
        break;
      case "ping":
        console.log("Webhook connection verified.");
        break;
      default:
        console.log(`-> Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error(` Error processing event: ${error}`);
  }
};

function handlePush(payload: any) {
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
}

function handleIssue(payload: any) {
  const action = payload.action || "unknown action";
  const issueNumber = payload.issue?.number || "unknown";
  const issueTitle = payload.issue?.title || "no title";
  const sender = payload.sender?.login || "unknown";

  console.log(
    `-> Issue #${issueNumber} "${issueTitle}" ${action} by ${sender}.`,
  );
}

function handleStar(payload: any) {
  const sender = payload.sender.login;
  const action = payload.action;
  const starCount = payload.repository.stargazers_count;

  if (action === "created") {
    console.log(`   -> New Star from ${sender}! Total: ${starCount}`);
  } else {
    console.log(`   -> Unstarred by ${sender}. Total: ${starCount}`);
  }
}
