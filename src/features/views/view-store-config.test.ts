import assert from "node:assert/strict";
import test from "node:test";

import { NoopViewStore } from "./adapters/noop-view-store";
import { hasViewStoreConfig } from "./view-store-config";
import { ViewStoreUnavailableError } from "./view.types";

test("keeps the view store disabled when configuration is missing", () => {
  assert.equal(hasViewStoreConfig({}), false);
  assert.equal(hasViewStoreConfig({ url: "https://redis.example" }), false);
  assert.equal(
    hasViewStoreConfig({
      url: "https://redis.example",
      token: "server-secret",
    }),
    true,
  );
});

test("the noop store reports unavailable instead of a fake count", async () => {
  const store = new NoopViewStore();
  await assert.rejects(() => store.get(), ViewStoreUnavailableError);
  await assert.rejects(() => store.increment(), ViewStoreUnavailableError);
});
