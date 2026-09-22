import { Redis } from "@upstash/redis";

import { createViewKey } from "../view-key";
import { ViewRateLimitError, type ViewStore } from "../view.types";

export type RedisClient = {
  get(key: string): Promise<number | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
};

const REQUEST_TIMEOUT_MS = 2_000;
const RATE_WINDOW_SECONDS = 10;
const RATE_LIMIT = 60;

function withTimeout<T>(operation: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("View store request timed out")),
      REQUEST_TIMEOUT_MS,
    );
    operation.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export class RedisViewStore implements ViewStore {
  constructor(private readonly redis: RedisClient) {}

  async get(slug: string): Promise<number> {
    const value = await withTimeout(this.redis.get(createViewKey(slug)));
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
  }

  async increment(slug: string): Promise<number> {
    const normalizedKey = createViewKey(slug);
    const window = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1_000));
    const rateKey = `${normalizedKey}:rate:${window}`;
    const attempts = await withTimeout(this.redis.incr(rateKey));
    if (attempts === 1) {
      await withTimeout(this.redis.expire(rateKey, RATE_WINDOW_SECONDS * 2));
    }
    if (attempts > RATE_LIMIT) throw new ViewRateLimitError();
    return withTimeout(this.redis.incr(normalizedKey));
  }
}

export function createRedisViewStore(url: string, token: string): ViewStore {
  return new RedisViewStore(new Redis({ url, token, enableTelemetry: false }));
}
