import { Request, Response } from "express";
import {
  handlePushEvent,
  handleIssueEvent,
  handleStarEvent,
  handleWatchEvent,
  getRecentEvents,
} from "../services/githubService";

export const handleWebhook = (req: Request, res: Response) => {
  const eventType = req.headers["x-github-event"] as string;
  const deliveryId = req.headers["x-github-delivery"] as string;
  const repoName = req.body.repository?.full_name || "unknown";

  if (!eventType || !deliveryId) {
    res.status(400).send("Bad Request: Missing required headers");
    return;
  }

  res.status(200).send("Event received");

  console.log(`\n Processing ${eventType} from ${repoName}`);

  try {
    switch (eventType) {
      case "push":
        handlePushEvent(req.body, deliveryId);
        break;
      case "issues":
        handleIssueEvent(req.body, deliveryId);
        break;
      case "star":
        handleStarEvent(req.body, deliveryId);
        break;
      case "watch":
        handleWatchEvent(req.body, deliveryId);
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

export const getEvents = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const events = await getRecentEvents(10, type);
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
