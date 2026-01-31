import { Request, Response, NextFunction } from "express";

export const verifyApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"] as string;
  const validApiKey = process.env.API_ACCESS_TOKEN;

  if (!validApiKey) {
    console.error("API_ACCESS_TOKEN is missing in .env");
    res.status(500).send("Server configuration error");
    return;
  }
  if (apiKey !== validApiKey) {
    console.warn(` Unauthorized access attempt from IP: ${req.ip}`);
    res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
    return;
  }
  next();
};
