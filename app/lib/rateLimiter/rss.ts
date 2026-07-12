import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * List user's subscriptions
 */
export const rssReadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "1 m"),
  analytics: true,
});

/**
 * Subscribe to a feed
 */
export const rssSubscribeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
});

/**
 * Remove a feed
 */
export const rssUnsubscribeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 h"),
  analytics: true,
});