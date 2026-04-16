import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../lib/redis";

const redisStore = () =>
  new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<
        number | string | (number | string)[]
      >,
  });

export const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: redisStore(),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You can only create 10 short URLs per minute.",
    });
  },
});

export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: redisStore(),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "Too many redirect requests. Please try again later.",
    });
  },
});
