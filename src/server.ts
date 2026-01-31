import { Request, Response } from "express";
import { pool } from "./db/connection";
import dotenv from "dotenv";

dotenv.config();

import app from "./app";
const PORT = process.env.PORT || 3000;

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log(" Database connected! Server time:", res.rows[0].now);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Git watch is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
