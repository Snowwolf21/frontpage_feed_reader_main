import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

/**
 * Create a checkout session
 * Prevent users from creating hundreds of checkout sessions.
 */
export const createSubscriptionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: false,
});

/**
 * Cancel subscription
 */
export const cancelSubscriptionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: false,
});

/**
 * Upgrade or downgrade subscription
 */
export const updateSubscriptionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: false,
});

/**
 * Customer portal
 */
export const billingPortalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: false,
});

/**
 * Verify payment
 */
export const paymentVerificationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 m"),
  analytics: false,
});