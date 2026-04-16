import { Router } from "express";
import base62 from "base62";
import getConfig from "../config";
import Url from "../models/url.model";
import Counter from "../models/counter.model";
import redis from "../lib/redis";
import { URL_REGEX, BASE62_REGEX } from "../lib/regex";
import { createUrlLimiter, redirectLimiter } from "../middleware/rateLimiter";

const config = getConfig();
const router = Router();

router.post("/shorten", createUrlLimiter, async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!URL_REGEX.test(originalUrl)) {
      return res.status(400).send("Invalid URL format");
    }

    const normalizedUrl = /^https?:\/\//i.test(originalUrl)
      ? originalUrl
      : `https://${originalUrl}`;

    const counter = await Counter.findByIdAndUpdate(
      "urls",
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true },
    );

    const sequenceId = counter!.seq;
    const shortCode = base62.encode(sequenceId);

    const url = await Url.create({
      originalUrl: normalizedUrl,
      sequenceId,
      shortCode,
    });

    return res.status(201).json(url);
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:shortCode", redirectLimiter, async (req, res) => {
  try {
    const shortCode = req.params.shortCode as string;

    if (!BASE62_REGEX.test(shortCode)) {
      return res.status(400).send("Invalid short code");
    }

    try {
      const cachedURL = await redis.get(shortCode);
      if (cachedURL) {
        return res.redirect(cachedURL);
      }
    } catch {
      // Redis unavailable, fall through to DB lookup
    }

    const url = await Url.findOne({
      sequenceId: base62.decode(shortCode),
    });

    if (!url) return res.status(404).send("No page found for this URL");

    try {
      await redis.set(shortCode, url.originalUrl!, "EX", config.CACHED_TTL);
    } catch {
      // Redis unavailable, continue without caching
    }

    return res.redirect(url.originalUrl!);
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
