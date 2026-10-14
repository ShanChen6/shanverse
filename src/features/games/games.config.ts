import { ROUTES } from "@/constants/routes";
import type { TranslationKey } from "@/i18n/messages";

import type { CategoryId } from "./categories";

// Games are code, not Notion content, so they are listed here.
// To add one: create src/features/games/<slug>/, a page under
// src/app/(site)/games/<slug>/, an entry below, and its sitemap path.
export type GameEntry = {
  slug: string;
  href: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Main category: the section the game sits in on /games. */
  category: CategoryId;
  /** Other categories it also shows up under when one is picked, and as labels on its card. */
  extraCategories?: CategoryId[];
  /** How it is played: keyboard, mouse, touch. */
  controlKeys: TranslationKey[];
  /** Shown in the mini game section on the home page (up to three). */
  featured?: boolean;
};

export const GAMES: GameEntry[] = [
  {
    slug: "nonogram",
    href: ROUTES.GAME_DETAIL("nonogram"),
    titleKey: "games.nonogramTitle",
    descriptionKey: "games.nonogramDescription",
    category: "puzzle-logic",
    controlKeys: ["games.tagMouse", "games.tagKeyboard", "games.tagTouch"],
  },
  {
    slug: "red-cliffs",
    href: ROUTES.GAME_DETAIL("red-cliffs"),
    titleKey: "games.redCliffsTitle",
    descriptionKey: "games.redCliffsDescription",
    category: "puzzle-logic",
    extraCategories: ["strategy-board"],
    controlKeys: ["games.tagMouse", "games.tagTouch"],
  },
  {
    slug: "sokoban",
    href: ROUTES.GAME_DETAIL("sokoban"),
    titleKey: "games.sokobanTitle",
    descriptionKey: "games.sokobanDescription",
    category: "puzzle-logic",
    controlKeys: ["games.tagKeyboard", "games.tagTouch"],
  },
  {
    slug: "2048",
    href: ROUTES.GAME_DETAIL("2048"),
    titleKey: "games.game2048Title",
    descriptionKey: "games.game2048Description",
    category: "puzzle-logic",
    extraCategories: ["math-brain"],
    controlKeys: ["games.tagKeyboard", "games.tagTouch"],
  },
  {
    slug: "minesweeper",
    href: ROUTES.GAME_DETAIL("minesweeper"),
    titleKey: "games.minesweeperTitle",
    descriptionKey: "games.minesweeperDescription",
    category: "puzzle-logic",
    controlKeys: ["games.tagMouse", "games.tagTouch"],
  },
  {
    slug: "bach-linh-ky",
    href: ROUTES.GAME_DETAIL("bach-linh-ky"),
    titleKey: "games.bachLinhKyTitle",
    descriptionKey: "games.bachLinhKyDescription",
    category: "strategy-board",
    controlKeys: ["games.tagMouse", "games.tagTouch"],
  },
  {
    slug: "go",
    href: ROUTES.GAME_DETAIL("go"),
    titleKey: "games.goTitle",
    descriptionKey: "games.goDescription",
    category: "strategy-board",
    controlKeys: ["games.tagMouse", "games.tagTouch"],
  },
  {
    slug: "snake",
    href: ROUTES.GAME_DETAIL("snake"),
    titleKey: "games.snakeTitle",
    descriptionKey: "games.snakeDescription",
    category: "arcade",
    extraCategories: ["action-reflex"],
    controlKeys: ["games.tagKeyboard", "games.tagTouch"],
    featured: true,
  },
  {
    slug: "memory",
    href: ROUTES.GAME_DETAIL("memory"),
    titleKey: "games.memoryTitle",
    descriptionKey: "games.memoryDescription",
    category: "memory",
    extraCategories: ["developer"],
    controlKeys: ["games.tagTouch", "games.tagMouse"],
    featured: true,
  },
  {
    slug: "word-guess",
    href: ROUTES.GAME_DETAIL("word-guess"),
    titleKey: "games.wordGuessTitle",
    descriptionKey: "games.wordGuessDescription",
    category: "word-language",
    extraCategories: ["quiz-trivia"],
    controlKeys: ["games.tagKeyboard", "games.tagTouch"],
  },
  {
    slug: "typing",
    href: ROUTES.GAME_DETAIL("typing"),
    titleKey: "games.typingTitle",
    descriptionKey: "games.typingDescription",
    category: "typing-speed",
    extraCategories: ["developer"],
    controlKeys: ["games.tagKeyboard"],
    featured: true,
  },
];

/** Games for the home page: the featured ones, topped up from the list. */
export function homeGames(limit = 3): GameEntry[] {
  const featured = GAMES.filter((game) => game.featured);
  const rest = GAMES.filter((game) => !game.featured);
  return [...featured, ...rest].slice(0, limit);
}
