import express from "express";
import mongoose from "mongoose";
import base62 from "base62";
import getConfig from "./config";
import Url from "./models/url.model";
import Counter from "./models/counter.model";
import Redis from "ioredis";

const redis = new Redis();
const app = express();
app.use(express.json());

const config = getConfig();
await mongoose.connect(config.MONGODB_URI);

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
const BASE62_REGEX = /^[A-Za-z0-9]+$/;

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  if (!BASE62_REGEX.test(shortCode)) {
    return res.status(400).send("Invalid short code");
  }

  const cachedURL = await redis.get(shortCode);
  if (cachedURL) {
    return res.redirect(cachedURL);
  }

  const url = await Url.findOne({
    sequenceId: base62.decode(shortCode),
  });

  if (!url) return res.status(404).send("No page found for this URL");
  await redis.set(shortCode, url.originalUrl!, "EX", config.CACHED_TTL);

  return res.redirect(url.originalUrl!);
});

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!URL_REGEX.test(originalUrl)) {
    return res.status(400).send("Invalid URL format");
  }

  const counter = await Counter.findByIdAndUpdate(
    "urls",
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  );

  const sequenceId = counter!.seq;
  const shortCode = base62.encode(sequenceId);

  const url = await Url.create({ originalUrl, sequenceId, shortCode });

  return res.status(201).json(url);
});

app.listen(3000, () => console.log("Server is running on PORT 3000"));
