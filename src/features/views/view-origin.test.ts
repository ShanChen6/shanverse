import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedViewOrigin } from "./view-origin";

const development = (origin: string | null, host = "localhost:3000") =>
  isAllowedViewOrigin({
    origin,
    requestUrl: `http://${host}/api/posts/post/views`,
    host,
    forwardedHost: null,
    forwardedProto: null,
    siteUrl: "http://localhost:3000",
    environment: "development",
  });

test("allows the exact localhost origin in development", () => {
  assert.equal(development("http://localhost:3000"), true);
  assert.equal(development("http://localhost:3001"), false);
});

test("allows exact loopback and LAN hosts serving the development request", () => {
  assert.equal(development("http://127.0.0.1:3000", "127.0.0.1:3000"), true);
  assert.equal(
    development("http://192.168.1.17:3000", "192.168.1.17:3000"),
    true,
  );
});

test("uses forwarded host exactly for a proxied development request", () => {
  assert.equal(
    isAllowedViewOrigin({
      origin: "http://192.168.1.17:3000",
      requestUrl: "http://localhost:3000/api/posts/post/views",
      host: "localhost:3000",
      forwardedHost: "192.168.1.17:3000",
      forwardedProto: "http",
      environment: "development",
    }),
    true,
  );
});

test("production only accepts the configured canonical origin", () => {
  const input = {
    requestUrl: "https://shanverse.example/api/posts/post/views",
    host: "shanverse.example",
    forwardedHost: null,
    forwardedProto: "https",
    siteUrl: "https://shanverse.example",
    environment: "production" as const,
  };
  assert.equal(
    isAllowedViewOrigin({ ...input, origin: "https://shanverse.example" }),
    true,
  );
  assert.equal(
    isAllowedViewOrigin({
      ...input,
      origin: "https://shanverse.example.attacker.test",
    }),
    false,
  );
  assert.equal(
    isAllowedViewOrigin({
      ...input,
      origin: "https://attacker.test/?next=shanverse.example",
    }),
    false,
  );
});

test("rejects missing and malformed origins", () => {
  assert.equal(development(null), false);
  assert.equal(development("not-a-url"), false);
});
