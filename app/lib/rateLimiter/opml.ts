import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Import OPML files
 * Expensive because it parses XML and may subscribe to many feeds.
 */
export const opmlImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: false,
});

/**
 * Export OPML
 * Much cheaper than importing.
 */
export const opmlExportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: false,
});

/**
 * Preview an OPML file before importing.
 */
export const opmlPreviewLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: false,
});