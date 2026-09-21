import assert from "node:assert/strict";
import test from "node:test";

import { validateGiscusConfig } from "./giscus.config";

test("keeps Giscus disabled by default", () => {
  assert.deepEqual(validateGiscusConfig({}), {
    enabled: false,
    config: null,
    reason: "disabled",
  });
});

test("does not enable Giscus with incomplete configuration", () => {
  assert.deepEqual(
    validateGiscusConfig({ enabled: "true", repo: "owner/repository" }),
    { enabled: false, config: null, reason: "invalid" },
  );
});

test("accepts a complete public Giscus configuration", () => {
  const result = validateGiscusConfig({
    enabled: "true",
    repo: "owner/repository",
    repoId: "R_example",
    category: "Comments",
    categoryId: "DIC_example",
  });
  assert.equal(result.enabled, true);
  if (result.enabled) assert.equal(result.config.repo, "owner/repository");
});
