import assert from "node:assert/strict";
import test from "node:test";

import type { NotionWordRow } from "@/types/notion";

import { validateEntry } from "./logic";
import { fromNotionRow, mergeWords, parseAccept, slugify, topicId } from "./notion-words";
import { TOPICS, WORDS } from "./words";

const row = (overrides: Partial<NotionWordRow> = {}): NotionWordRow => ({
  pageId: "3f8cb89c-71c6-8178-a4f7-fae6bdc31e51",
  answer: "Vercel",
  question: "Nền tảng nào thường được dùng để deploy các dự án Next.js?",
  hints: [
    "Nó là một nền tảng đám mây, không phải framework.",
    "Mỗi pull request được tạo sẵn một bản preview riêng.",
    "Công ty đứng sau nó cũng là công ty tạo ra Next.js.",
    "Shanverse đang được deploy trên nó.",
    "Logo là một hình tam giác màu đen.",
  ],
  accept: "",
  topic: "Công nghệ",
  published: true,
  ...overrides,
});

test("slugify makes ids from Vietnamese names", () => {
  assert.equal(slugify("Lịch sử Việt Nam"), "lich-su-viet-nam");
  assert.equal(slugify("  Đồ ăn & thức uống "), "do-an-thuc-uong");
});

test("topicId matches known topics by id or either label, and slugs new ones", () => {
  assert.equal(topicId("Công nghệ", TOPICS), "tech");
  assert.equal(topicId("cong nghe", TOPICS), "tech");
  assert.equal(topicId("Everyday life", TOPICS), "life");
  assert.equal(topicId("tech", TOPICS), "tech");
  assert.equal(topicId("Lịch sử", TOPICS), "lich-su");
});

test("parseAccept splits on commas, semicolons and new lines", () => {
  assert.deepEqual(parseAccept("k8s, kube ;\n kubernetes engine,, "), ["k8s", "kube", "kubernetes engine"]);
  assert.deepEqual(parseAccept(""), []);
});

test("a complete Notion row becomes a valid entry with a notion: id", () => {
  const entry = fromNotionRow(row({ accept: "vercel.com" }), TOPICS);
  assert.equal(entry.id, "notion:3f8cb89c-71c6-8178-a4f7-fae6bdc31e51");
  assert.equal(entry.topic, "tech");
  assert.deepEqual(entry.accept, ["vercel.com"]);
  assert.equal(entry.hints.length, 5);
  assert.deepEqual(validateEntry(entry), []);
});

test("missing hints become empty strings, which validation rejects", () => {
  const entry = fromNotionRow(row({ hints: ["only one"] }), TOPICS);
  assert.equal(entry.hints.length, 5);
  assert.ok(validateEntry(entry).some((problem) => problem.includes("hint 2")));
});

test("mergeWords adds published, valid rows and skips the rest with a reason", () => {
  const { words, skipped } = mergeWords(WORDS, [
    row(),
    row({ pageId: "aaaaaaaa-0000-0000-0000-000000000001", answer: "Draft", published: false }),
    row({ pageId: "aaaaaaaa-0000-0000-0000-000000000002", answer: "Broken", hints: ["a", "", "", "", ""] }),
    row({ pageId: "aaaaaaaa-0000-0000-0000-000000000003", answer: "Leaky", hints: ["a", "b", "c", "d", "It is Leaky"] }),
    row({ pageId: "aaaaaaaa-0000-0000-0000-000000000004", answer: "No topic", topic: " " }),
  ], TOPICS);
  assert.equal(words.length, WORDS.length + 1);
  assert.ok(words.some((word) => word.answer === "Vercel"));
  assert.ok(!words.some((word) => word.answer === "Draft"), "unpublished rows are ignored silently");
  assert.equal(skipped.length, 3);
  assert.ok(skipped.some((line) => line.startsWith('"Broken"')));
  assert.ok(skipped.some((line) => line.startsWith('"Leaky"') && line.includes("gives the answer away")));
});

test("a Notion word with a built-in answer replaces the built-in one", () => {
  const docker = WORDS.find((word) => word.answer === "Docker");
  assert.ok(docker);
  const { words } = mergeWords(WORDS, [row({ answer: "docker", question: "Công cụ nào chạy container?", hints: docker.hints })], TOPICS);
  assert.equal(words.length, WORDS.length);
  assert.ok(!words.some((word) => word.id === docker.id));
  assert.ok(words.some((word) => word.id.startsWith("notion:") && word.answer === "docker"));
});

test("duplicate answers within Notion keep the first row", () => {
  const { words, skipped } = mergeWords([], [row(), row({ pageId: "aaaaaaaa-0000-0000-0000-000000000009" })], TOPICS);
  assert.equal(words.length, 1);
  assert.equal(skipped.length, 1);
});

test("a new topic from Notion gets its own label", () => {
  const { words, topics } = mergeWords([], [row({ topic: "Lịch sử" })], TOPICS);
  assert.equal(words[0].topic, "lich-su");
  assert.deepEqual(topics["lich-su"], { vi: "Lịch sử", en: "Lịch sử" });
  assert.deepEqual(topics.tech, TOPICS.tech, "known labels are kept");
});
