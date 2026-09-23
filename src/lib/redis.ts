import "server-only";

import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

export function createRedisClient(url: string, token: string): Redis {
  return new Redis({
    url,
    token,
    cache: "no-store",
    enableAutoPipelining: false,
    // In SDK 1.39, retry:false still performs two attempts. Never replay INCR
    // after a lost HTTP response: the first command may already have succeeded.
    retry: { retries: 0 },
    signal: () => AbortSignal.timeout(5_000),
  });
}

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) throw new Error("Blog view storage is not configured.");
    redis = createRedisClient(url, token);
  }
  return redis;
}
