import { Router, Request, Response } from "express";
import { getEvents, handleWebhook } from "../controllers/webhookController";
import verifySignature from "../middlewares/verifyGithub";
import { verifyApiKey } from "../middlewares/verifyApiKey";

const router = Router();

router.post("/", verifySignature, handleWebhook);
router.get("/events", verifyApiKey, getEvents);
export default router;
