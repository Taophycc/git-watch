import { Router, Request, Response } from "express";
import { handleWebhook } from "../controllers/webhookController";
import verifySignature from "../middlewares/verifyGithub";

const router = Router();

router.post("/",verifySignature,  handleWebhook);
export default router;
