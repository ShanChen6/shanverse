import "server-only";

import { createHash } from "node:crypto";

import { getRedis } from "@/lib/redis";

// Generous enough for shared IPs (offices, mobile carriers, CGNAT), tight enough
// that a script cannot drive Notion or Redis usage up through this API.
export const VIEW_RATE_LIMIT = 120;
export const VIEW_RATE_WINDOW_SECONDS = 60;

export type RateLimitRedis = {
  set(key: string, value: number, options: { nx: true; ex: number }): Promise<unknown>;
  incr(key: string): Promise<number>;
};

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
  now?: () => number;
};

// Fixed-window limiter. Returns true while the client is within its budget.
export function createRateLimiter(
  redisProvider: () => RateLimitRedis,
  { limit, windowSeconds, now = Date.now }: RateLimitOptions,
) {
  return async (clientKey: string): Promise<boolean> => {
    const redis = redisProvider();
    const window = Math.floor(now() / 1000 / windowSeconds);
    // Hash so raw IP addresses are never stored.
    const client = createHash("sha256").update(clientKey).digest("hex");
    const key = `blog:views-rate:v1:${window}:${client}`;
    // Create the counter with its expiry before incrementing, so a failed or
    // lost INCR can never leave a key without a TTL.
    await redis.set(key, 0, { nx: true, ex: windowSeconds * 2 });
    return (await redis.incr(key)) <= limit;
  };
}

export const allowViewRequest = createRateLimiter(getRedis, {
  limit: VIEW_RATE_LIMIT,
  windowSeconds: VIEW_RATE_WINDOW_SECONDS,
});
