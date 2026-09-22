import assert from "node:assert/strict";
import test from "node:test";

import {
  VIEW_OBSERVER_OPTIONS,
  VIEW_SENTINEL_SELECTOR,
} from "./view-observer";

test("observes the dedicated view sentinel without an area threshold", () => {
  assert.equal(VIEW_SENTINEL_SELECTOR, "[data-view-sentinel]");
  assert.equal(VIEW_OBSERVER_OPTIONS.threshold, 0);
  assert.equal(VIEW_OBSERVER_OPTIONS.rootMargin, "0px 0px -20% 0px");
});
