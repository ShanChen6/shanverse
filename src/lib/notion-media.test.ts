import assert from "node:assert/strict";
import test from "node:test";

import { notionMediaUrl, parseNotionMediaPath, safeImageSource } from "./notion-media";

const id = "1a2b3c4d-1a2b-1a2b-1a2b-1a2b3c4d5e6f";
const compactId = "1a2b3c4d1a2b1a2b1a2b1a2b3c4d5e6f";

test("block and page targets round-trip through their URL", () => {
	const blockUrl = notionMediaUrl({ kind: "block", id }, "2026-10-10T10:00:00.000Z");
	assert.match(blockUrl, /^\/api\/notion-media\/block\/1a2b3c4d1a2b1a2b1a2b1a2b3c4d5e6f\?v=[0-9a-z]+$/);
	const blockPath = new URL(blockUrl, "https://example.com").pathname.split("/").slice(3);
	assert.deepEqual(parseNotionMediaPath(blockPath), { kind: "block", id: compactId });

	const pageUrl = notionMediaUrl({ kind: "page", id, slot: "thumbnailImage" }, "2026-10-10T10:00:00.000Z");
	const pagePath = new URL(pageUrl, "https://example.com").pathname.split("/").slice(3);
	assert.deepEqual(parseNotionMediaPath(pagePath), { kind: "page", id: compactId, slot: "thumbnailImage" });
});

test("version changes when the Notion item is edited", () => {
	const before = notionMediaUrl({ kind: "block", id }, "2026-10-10T10:00:00.000Z");
	const after = notionMediaUrl({ kind: "block", id }, "2026-10-10T10:05:00.000Z");
	assert.notEqual(before, after);
});

test("rejects unknown kinds, slots, bad ids and extra segments", () => {
	assert.equal(parseNotionMediaPath(["file", compactId]), null);
	assert.equal(parseNotionMediaPath(["page", compactId, "avatar"]), null);
	assert.equal(parseNotionMediaPath(["block", "../../etc/passwd"]), null);
	assert.equal(parseNotionMediaPath(["block", compactId, "extra"]), null);
	assert.equal(parseNotionMediaPath([]), null);
});

test("safeImageSource accepts same-origin paths and http(s) only", () => {
	assert.equal(safeImageSource("/api/notion-media/block/x?v=1"), "/api/notion-media/block/x?v=1");
	assert.equal(safeImageSource("https://images.unsplash.com/a.jpg"), "https://images.unsplash.com/a.jpg");
	assert.equal(safeImageSource("//evil.example/a.png"), null);
	assert.equal(safeImageSource("javascript:alert(1)"), null);
	assert.equal(safeImageSource("  "), null);
	assert.equal(safeImageSource(null), null);
});
