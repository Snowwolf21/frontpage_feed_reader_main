import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Read article
 * Lightweight endpoint.
 */
export const articleReadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(300, "1 m"),
  analytics: true,
});

/**
 * Search articles
 */
export const articleSearchLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});

/**
 * Create article
 */
export const articleCreateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
});

/**
 * Update article
 */
export const articleUpdateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  analytics: true,
});

/**
 * Delete article
 */
export const articleDeleteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
});

/**
 * Bookmark article
 */
export const articleBookmarkLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 h"),
  analytics: true,
});

/**
 * Like / Favorite article
 */
export const articleReactionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
});

/**
 * AI summary endpoint
 * Expensive because it calls an LLM.
 */
export const articleSummaryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
});

/**
 * AI rewrite / translation
 */
export const articleAILimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
});