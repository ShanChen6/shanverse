import assert from "node:assert/strict";
import test from "node:test";

import { buildEmbedSrc, parseBaseUrl, readHeightMessage } from "./embed";

test("parseBaseUrl accepts http(s) URLs only", () => {
  assert.equal(parseBaseUrl(undefined), null);
  assert.equal(parseBaseUrl(""), null);
  assert.equal(parseBaseUrl("not a url"), null);
  assert.equal(parseBaseUrl("javascript:alert(1)"), null);
  assert.equal(parseBaseUrl(" https://co-lau.vercel.app ")?.origin, "https://co-lau.vercel.app");
});

test("buildEmbedSrc points at /demo with the theme", () => {
  const base = parseBaseUrl("https://co-lau.vercel.app/")!;
  assert.equal(buildEmbedSrc(base, "light"), "https://co-lau.vercel.app/demo?theme=light");
  assert.equal(buildEmbedSrc(base, "dark"), "https://co-lau.vercel.app/demo?theme=dark");
});

test("readHeightMessage reads only well-formed height messages", () => {
  assert.equal(readHeightMessage({ type: "colau:height", height: 812.4 }), 813);
  assert.equal(readHeightMessage({ type: "colau:height", height: 0 }), null);
  assert.equal(readHeightMessage({ type: "colau:height", height: "800" }), null);
  assert.equal(readHeightMessage({ type: "other", height: 800 }), null);
  assert.equal(readHeightMessage("colau:height"), null);
  assert.equal(readHeightMessage(null), null);
});
