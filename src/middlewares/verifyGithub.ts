import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

const verifySignature = (
  req: RequestWithRawBody,
  res: Response,
  next: NextFunction,
) => {
  const signature = req.headers["x-hub-signature-256"] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.error(" GITHUB_WEBHOOK_SECRET is missing in .env");
    res.status(500).send("Server configuration error");
    return;
  }

  if (!signature) {
    res.status(401).send("Missing X-Hub-Signature-256 header");
    return;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest =
    "sha256=" + hmac.update(req.rawBody || Buffer.from("")).digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);

  if (
    signatureBuffer.length !== digestBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, digestBuffer)
  ) {
    console.warn(" Invalid Signature. Possible tampering detected.");
    res.status(401).send("Invalid signature");
    return;
  }

  next();
};

export default verifySignature;
