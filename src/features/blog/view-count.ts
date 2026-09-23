import "server-only";

import { createHash } from "node:crypto";

import { getRedis } from "@/lib/redis";

export const VIEW_DEDUPE_SECONDS = 24 * 60 * 60;

export type ViewCountResult = { views: number; counted: boolean };

export type ViewCountRedis = {
  get(key: string): Promise<unknown>;
  set(key: string, value: number, options: { nx: true; ex: number }): Promise<unknown>;
  incr(key: string): Promise<number>;
};

function viewNumber(value: unknown): number {
  if (value === null) return 0;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid blog view count.");
  }
  return value;
}

export function createViewCounter(redisProvider: () => ViewCountRedis) {
  const getViews = async (slug: string): Promise<number> =>
    viewNumber(await redisProvider().get(`blog:views:v1:${slug}`));

  const incrView = async (slug: string, visitorId: string): Promise<ViewCountResult> => {
    const redis = redisProvider();
    const visitorHash = createHash("sha256").update(visitorId).digest("hex");
    const claim = await redis.set(
      `blog:view-dedupe:v1:${slug}:${visitorHash}`,
      1,
      { nx: true, ex: VIEW_DEDUPE_SECONDS },
    );
    if (claim === null) return { views: await getViews(slug), counted: false };
    if (claim !== "OK") throw new Error("Unable to reserve blog view.");

    // Keep the claim if INCR fails: a lost response cannot tell us whether the
    // increment committed. Releasing it could double count a retry.
    return { views: viewNumber(await redis.incr(`blog:views:v1:${slug}`)), counted: true };
  };

  return { getViews, incrView };
}

export const { getViews, incrView } = createViewCounter(getRedis);
