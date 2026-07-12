import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Current user profile (/api/me)
 * Frequently called by the frontend.
 */
export const meLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
});