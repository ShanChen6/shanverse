import assert from "node:assert/strict";
import test from "node:test";

import type { NotionContentBlock } from "@/types/notion";
import { caseStudyKind, splitCaseStudy } from "./case-study";
import { parseHighlights } from "./project-highlights";
import { compareProjects } from "./project-sort";
import { filterProjects, parseProjectQuery, projectHref, showProjectTools } from "./project-query";
import type { Project } from "@/types/project";

const project = (title: string, extra: { order?: number | null; date?: string | null; createdAt?: string } = {}) => ({
  title,
  order: extra.order ?? null,
  date: extra.date ?? null,
  createdAt: extra.createdAt ?? "2026-01-01T00:00:00.000Z",
});

test("projects with an Order come first, smallest first; the rest by project date, newest first", () => {
  const list = [
    project("old", { date: "2023-05-01" }),
    project("second", { order: 2 }),
    project("new", { date: "2025-05-01" }),
    project("first", { order: 1 }),
  ];
  assert.deepEqual(list.sort(compareProjects).map((item) => item.title), ["first", "second", "new", "old"]);
});

test("a project date beats the Notion page creation time", () => {
  const rewritten = project("made in 2023", { date: "2023-01-01", createdAt: "2026-06-01T00:00:00.000Z" });
  const recent = project("made in 2025", { date: "2025-01-01", createdAt: "2025-01-02T00:00:00.000Z" });
  assert.deepEqual([rewritten, recent].sort(compareProjects).map((item) => item.title), ["made in 2025", "made in 2023"]);
});

test("without any date the creation time and then the title decide", () => {
  const a = project("a", { createdAt: "2026-02-01T00:00:00.000Z" });
  const b = project("b", { createdAt: "2026-02-01T00:00:00.000Z" });
  assert.deepEqual([b, a].sort(compareProjects).map((item) => item.title), ["a", "b"]);
});

test("highlights read 'value | label' lines and skip bad ones", () => {
  const text = "98 | Lighthouse score\n\nno divider\n | missing value\n3x | Faster builds\n12345678901234567 | value too long\n40% | Less code";
  assert.deepEqual(parseHighlights(text), [
    { value: "98", label: "Lighthouse score" },
    { value: "3x", label: "Faster builds" },
    { value: "40%", label: "Less code" },
  ]);
  assert.deepEqual(parseHighlights(""), []);
  assert.deepEqual(parseHighlights(null), []);
});

test("at most four highlights are kept", () => {
  const text = Array.from({ length: 7 }, (_, i) => `${i} | item ${i}`).join("\n");
  assert.equal(parseHighlights(text).length, 4);
});

test("case-study headings match in Vietnamese and English, with or without accents", () => {
  assert.equal(caseStudyKind("Vấn đề"), "problem");
  assert.equal(caseStudyKind("Giải pháp:"), "solution");
  assert.equal(caseStudyKind("Kết quả"), "result");
  assert.equal(caseStudyKind("Bài học"), "lessons");
  assert.equal(caseStudyKind("Results"), "result");
  assert.equal(caseStudyKind("Tech stack"), null);
});

const block = (id: string, type: string, text = ""): NotionContentBlock => ({
  id,
  type,
  richText: text ? [{ plainText: text } as NotionContentBlock["richText"][number]] : [],
  children: [],
});

test("a page with two known headings becomes a case study", () => {
  const blocks = [
    block("p0", "paragraph", "intro"),
    block("h1", "heading_2", "Vấn đề"),
    block("p1", "paragraph"),
    block("h2", "heading_2", "Giải pháp"),
    block("p2", "paragraph"),
    block("h3", "heading_2", "Ghi chú khác"),
    block("p3", "paragraph"),
  ];
  const study = splitCaseStudy(blocks);
  assert.ok(study);
  assert.deepEqual(study.intro.map((item) => item.id), ["p0"]);
  assert.deepEqual(study.sections.map((section) => section.kind), ["problem", "solution", null]);
  assert.deepEqual(study.sections[2].blocks.map((item) => item.id), ["p3"]);
});

test("a page with fewer than two known headings stays as it is", () => {
  assert.equal(splitCaseStudy([block("h1", "heading_2", "Kết quả"), block("p1", "paragraph")]), null);
  assert.equal(splitCaseStudy([block("p1", "paragraph")]), null);
});

const filterable = (title: string, status: string | null, tech: string[] = []) =>
  ({ title, description: "", summary: null, status, techStack: tech, tags: [] }) as unknown as Project;

test("projects can be filtered by status, and the status stays in the link", () => {
  const list = [filterable("a", "Hoàn thành"), filterable("b", "Đang làm"), filterable("c", null)];
  const query = parseProjectQuery({ status: "hoàn thành" });
  assert.deepEqual(filterProjects(list, query).map((p) => p.title), ["a"]);
  assert.equal(projectHref(query, { tech: "React" }), "/projects?tech=React&status=ho%C3%A0n+th%C3%A0nh");
  assert.equal(filterProjects(list, parseProjectQuery({})).length, 3);
});

test("the filter bar is hidden for a short list unless a filter is already active", () => {
  assert.equal(showProjectTools(3, false), false);
  assert.equal(showProjectTools(6, false), true);
  assert.equal(showProjectTools(3, true), true);
});
