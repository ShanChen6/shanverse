import type { TranslationKey } from "@/i18n/messages";

// Game categories, in the order they appear on /games. A category with no
// game is not shown, so new ones can be listed here before their first game.
export const CATEGORIES = [
  { id: "puzzle-logic", labelKey: "games.catPuzzleLogic" },
  { id: "strategy-board", labelKey: "games.catStrategyBoard" },
  { id: "arcade", labelKey: "games.catArcade" },
  { id: "action-reflex", labelKey: "games.catActionReflex" },
  { id: "memory", labelKey: "games.catMemory" },
  { id: "word-language", labelKey: "games.catWordLanguage" },
  { id: "typing-speed", labelKey: "games.catTypingSpeed" },
  { id: "quiz-trivia", labelKey: "games.catQuizTrivia" },
  { id: "math-brain", labelKey: "games.catMathBrain" },
  { id: "card", labelKey: "games.catCard" },
  { id: "developer", labelKey: "games.catDeveloper" },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[];

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const isCategoryId = (value: unknown): value is CategoryId =>
  typeof value === "string" && CATEGORIES.some((category) => category.id === value);

type Categorized = { category: CategoryId; extraCategories?: readonly CategoryId[] };

/** Every category a game belongs to, its main one first. */
export const categoriesOf = (game: Categorized): CategoryId[] => [game.category, ...(game.extraCategories ?? [])];

/** Categories that have at least one game (main or extra), in display order. */
export function usedCategories(games: readonly Categorized[]): (typeof CATEGORIES)[number][] {
  const used = new Set(games.flatMap(categoriesOf));
  return CATEGORIES.filter((category) => used.has(category.id));
}
