import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Feed refresh
 * Refresh feeds every 10 minutes
 */
export const feedFetchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "10 m"),
  analytics: true,
});

/**
 * Feed import
 * Prevent users importing hundreds of feeds
 */
export const feedImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});

/**
 * OPML upload limiter
 */
export const opmlImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
});

/**
 * Feed search
 * Used when discovering RSS feeds
 */
export const feedSearchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 m"),
  analytics: true,
});