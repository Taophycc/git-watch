import express from "express";
import { RequestWithRawBody } from "./middlewares/verifyGithub";
import webhookRoutes from "./routes/webhookRoutes";

const app = express();

app.use(
  express.json({
    verify: (req: RequestWithRawBody, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use("/webhook", webhookRoutes);

export default app;
