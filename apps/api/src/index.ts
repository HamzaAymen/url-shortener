import express from "express";
import mongoose from "mongoose";
import getConfig from "./config";
import redis from "./lib/redis";
import urlRoutes from "./routes/url.routes";

const config = getConfig();
await mongoose.connect(config.MONGODB_URI);

const app = express();
app.use(express.json());
app.use(urlRoutes);

const server = app.listen(config.PORT, () =>
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
