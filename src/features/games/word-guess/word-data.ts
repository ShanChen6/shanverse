import "server-only";

import { unstable_cache } from "next/cache";

import { notionService } from "@/services/notion.service";

import { mergeWords, type MergeResult } from "./notion-words";
import { TOPICS, WORDS } from "./words";

// Same cache window as the other Notion content: a new or edited word shows
// up within five minutes.
const loadNotionWords = unstable_cache(() => notionService.getWords(), ["notion-word-list"], {
  revalidate: 300,
  tags: ["notion-words"],
});

/**
 * Built-in words merged with the published rows of the Notion Word Guess
 * database. Broken rows are skipped and logged; if Notion is unavailable or
 * not configured, the game still gets its built-in words.
 */
export async function getWordGuessData(): Promise<Pick<MergeResult, "words" | "topics">> {
  let rows: Awaited<ReturnType<typeof loadNotionWords>> = [];
  try {
    rows = await loadNotionWords();
  } catch (error) {
    console.warn("[word-guess] Notion is unavailable, using the built-in words only:", error instanceof Error ? error.message : error);
  }
  const { words, topics, skipped } = mergeWords(WORDS, rows, TOPICS);
  for (const line of skipped) console.warn(`[word-guess] skipped Notion word ${line}`);
  return { words, topics };
}
