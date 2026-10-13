// Turns rows of the Notion "Word Guess" database into game entries. Pure
// functions, no Notion client: notion.service.ts reads the rows, word-data.ts
// caches and merges them, and this file is unit-tested.

import type { NotionWordRow } from "@/types/notion";

import { MAX_HINTS, normalize, validateEntry, type Hints, type WordEntry } from "./logic";

export type TopicLabels = Record<string, { vi: string; en: string }>;

/** "Lịch sử Việt Nam" → "lich-su-viet-nam". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The topic id for a Notion select option: a known topic when the name
 * matches its id or either label ("Công nghệ", "Tech", "tech"), otherwise a
 * new topic named after the option.
 */
export function topicId(name: string, topics: TopicLabels): string {
  const key = normalize(name);
  for (const [id, label] of Object.entries(topics)) {
    if ([id, label.vi, label.en].some((value) => normalize(value) === key)) return id;
  }
  return slugify(name);
}

/** "k8s, kube" → ["k8s", "kube"]. Also accepts new lines and semicolons. */
export const parseAccept = (text: string) =>
  text
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export function fromNotionRow(row: NotionWordRow, topics: TopicLabels): WordEntry {
  const hints = Array.from({ length: MAX_HINTS }, (_, i) => (row.hints[i] ?? "").trim()) as Hints;
  return {
    id: `notion:${row.pageId}`,
    topic: topicId(row.topic, topics),
    question: row.question.trim(),
    hints,
    answer: row.answer.trim(),
    accept: parseAccept(row.accept),
  };
}

export type MergeResult = {
  words: WordEntry[];
  topics: TopicLabels;
  /** One line per Notion row that was left out, for the server log. */
  skipped: string[];
};

/**
 * Built-in words plus published Notion rows that pass validateEntry. A Notion
 * word with the same answer as a built-in one replaces it, so a word can be
 * moved to Notion and edited there. New topics get their Notion name as the
 * label in both languages.
 */
export function mergeWords(builtIn: readonly WordEntry[], rows: readonly NotionWordRow[], topics: TopicLabels): MergeResult {
  const skipped: string[] = [];
  const labels: TopicLabels = { ...topics };
  const fromNotion: WordEntry[] = [];
  const answers = new Set<string>();

  for (const row of rows) {
    if (!row.published) continue;
    const name = row.answer.trim() || row.pageId;
    if (!row.topic.trim()) {
      skipped.push(`"${name}": no topic`);
      continue;
    }
    const entry = fromNotionRow(row, labels);
    const problems = validateEntry(entry);
    if (problems.length) {
      skipped.push(`"${name}": ${problems.join("; ")}`);
      continue;
    }
    const key = normalize(entry.answer);
    if (answers.has(key)) {
      skipped.push(`"${name}": another Notion row has the same answer`);
      continue;
    }
    answers.add(key);
    if (!labels[entry.topic]) labels[entry.topic] = { vi: row.topic.trim(), en: row.topic.trim() };
    fromNotion.push(entry);
  }

  const kept = builtIn.filter((word) => !answers.has(normalize(word.answer)));
  return { words: [...kept, ...fromNotion], topics: labels, skipped };
}
