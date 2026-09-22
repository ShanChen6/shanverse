import "server-only";

import { createRedisViewStore } from "./redis-view-store";
import { NoopViewStore } from "./noop-view-store";
import type { ViewStore } from "../view.types";
import { hasViewStoreConfig } from "../view-store-config";

export function isViewStoreConfigured(): boolean {
  return hasViewStoreConfig({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

let store: ViewStore | undefined;

export function getViewStore(): ViewStore {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  store = url && token ? createRedisViewStore(url, token) : new NoopViewStore();
  return store;
}
