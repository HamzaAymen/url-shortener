import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import getConfig from "./config";
import redis from "./lib/redis";
import urlRoutes from "./routes/url.routes";

const config = getConfig();
await mongoose.connect(config.MONGODB_URI);

const app = express();
app.use(
  cors({ origin: config.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? false }),
);
app.use(express.json());
app.get("/health", (_req, res) => {
  res.send("ok");
});
app.use(urlRoutes);

const server = app.listen(Number(config.PORT), "0.0.0.0", () =>
  console.log(`Server is running on PORT ${config.PORT}`),
);

const shutdown = async () => {
  console.log("Shutting down...");
  server.close();
  await mongoose.disconnect();
  redis.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
