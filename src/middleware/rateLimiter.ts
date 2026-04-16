import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../lib/redis";

export const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args: string[]) =>
      redis.call(...(args as [string, ...string[]])) as Promise<
        number | string | (number | string)[]
      >,
  }),

  handler: (_req, res) => {
    res.status(429).json({
      error: "Too many requests",
      message: "You can only create 10 short URLs per minute.",
    });
  },
});
