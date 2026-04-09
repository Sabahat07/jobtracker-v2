import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authRouter, appRouter, aiRouter } from "./routes";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRouter);
app.use("/api/applications", appRouter);
app.use("/api/ai", aiRouter);
app.get("/api/health", (_, res) => res.json({ status: "OK" }));

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGODB_URI || "";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err: Error) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
