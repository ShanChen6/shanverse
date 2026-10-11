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
};

export const GAMES: GameEntry[] = [
  {
    slug: "2048",
    href: ROUTES.GAME_DETAIL("2048"),
    titleKey: "games.game2048Title",
    descriptionKey: "games.game2048Description",
    tagKeys: ["games.tagPuzzle", "games.tagKeyboard", "games.tagTouch"],
  },
];
