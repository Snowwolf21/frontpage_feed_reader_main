// app/lib/rateLimiter/star.ts

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Star / Unstar articles
 * Users may click several times while browsing,
 * so allow a fairly generous limit.
 */
export const starLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: false,
});