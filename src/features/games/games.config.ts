import { ROUTES } from "@/constants/routes";
import type { TranslationKey } from "@/i18n/messages";

// Games are code, not Notion content, so they are listed here.
// To add one: create src/features/games/<slug>/, a page under
// src/app/(site)/games/<slug>/, an entry below, and its sitemap path.
export type GameEntry = {
  slug: string;
  href: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  tagKeys: TranslationKey[];
  /** Shown in the mini game section on the home page (up to three). */
  featured?: boolean;
};

export const GAMES: GameEntry[] = [
  {
    slug: "2048",
    href: ROUTES.GAME_DETAIL("2048"),
    titleKey: "games.game2048Title",
    descriptionKey: "games.game2048Description",
    tagKeys: ["games.tagPuzzle", "games.tagKeyboard", "games.tagTouch"],
  },
  {
    slug: "minesweeper",
    href: ROUTES.GAME_DETAIL("minesweeper"),
    titleKey: "games.minesweeperTitle",
    descriptionKey: "games.minesweeperDescription",
    tagKeys: ["games.tagPuzzle", "games.tagMouse", "games.tagTouch"],
  },
  {
    slug: "typing",
    href: ROUTES.GAME_DETAIL("typing"),
    titleKey: "games.typingTitle",
    descriptionKey: "games.typingDescription",
    tagKeys: ["games.tagCode", "games.tagKeyboard"],
    featured: true,
  },
  {
    slug: "memory",
    href: ROUTES.GAME_DETAIL("memory"),
    titleKey: "games.memoryTitle",
    descriptionKey: "games.memoryDescription",
    tagKeys: ["games.tagMemory", "games.tagTouch", "games.tagMouse"],
    featured: true,
  },
  {
    slug: "snake",
    href: ROUTES.GAME_DETAIL("snake"),
    titleKey: "games.snakeTitle",
    descriptionKey: "games.snakeDescription",
    tagKeys: ["games.tagReflex", "games.tagKeyboard", "games.tagTouch"],
    featured: true,
  },
];

/** Games for the home page: the featured ones, topped up from the list. */
export function homeGames(limit = 3): GameEntry[] {
  const featured = GAMES.filter((game) => game.featured);
  const rest = GAMES.filter((game) => !game.featured);
  return [...featured, ...rest].slice(0, limit);
}
