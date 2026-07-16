import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

// Feed preview limit
export const feedPreviewLimiter =
new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    20,
    "10 m"
  ),
  analytics: false,
});

/**
 * Feed search
 * Used when discovering RSS feeds
 */
export const feedSearchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 m"),
  analytics: false,
});

// Multi-feed limit
export const multiFeedLimiter =
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      20,
      "10 m"
    ),
    analytics: false,
  });

/**
 * Feed refresh
 * Refresh feeds every 10 minutes
 */
export const feedFetchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: false,
});

/**
 * Feed import
 * Prevent users importing hundreds of feeds
 */
export const feedImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: false,
});





