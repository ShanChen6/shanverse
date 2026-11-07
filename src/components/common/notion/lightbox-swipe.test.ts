import assert from "node:assert/strict";
import test from "node:test";

import { swipeStep } from "./NotionLightbox";

test("a long mostly-sideways drag changes the image; left goes forward, right goes back", () => {
  assert.equal(swipeStep(-80, 10), 1);
  assert.equal(swipeStep(80, -10), -1);
});

test("short drags and taps are not swipes", () => {
  assert.equal(swipeStep(30, 0), 0);
  assert.equal(swipeStep(0, 0), 0);
  assert.equal(swipeStep(-49, 0), 0);
});

test("a mostly vertical drag is a scroll, not a swipe", () => {
  assert.equal(swipeStep(-60, 80), 0);
  assert.equal(swipeStep(-60, 40), 1);
});
