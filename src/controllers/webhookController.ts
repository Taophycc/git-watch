import { Request, Response } from "express";
import {
  handlePushEvent,
  handleIssueEvent,
  handleStarEvent,
} from "../services/githubService";

export const handleWebhook = (req: Request, res: Response) => {
  res.status(200).send("Event received");

  const eventType = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;
  const repoName = req.body.repository?.full_name || "unknown";

  console.log(`\n Processing ${eventType} from ${repoName}`);

  try {
    switch (eventType) {
      case "push":
        handlePushEvent(req.body);
        break;
      case "issues":
        handleIssueEvent(req.body);
        break;
      case "star":
        handleStarEvent(req.body);
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
