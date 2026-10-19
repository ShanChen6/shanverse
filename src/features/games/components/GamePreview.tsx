import * as React from "react";

import { BachLinhKyPreview } from "./BachLinhKyPreview";
import { CoLauPreview } from "./CoLauPreview";
import { Game2048Preview } from "./Game2048Preview";
import { GoPreview } from "./GoPreview";
import { MemoryPreview } from "./MemoryPreview";
import { MinesweeperPreview } from "./MinesweeperPreview";
import { NonogramPreview } from "./NonogramPreview";
import { RedCliffsPreview } from "./RedCliffsPreview";
import { SnakePreview } from "./SnakePreview";
import { SokobanPreview } from "./SokobanPreview";
import { TypingPreview } from "./TypingPreview";
import { WordGuessPreview } from "./WordGuessPreview";

const PREVIEWS: Record<string, React.ComponentType> = {
  "2048": Game2048Preview,
  minesweeper: MinesweeperPreview,
  typing: TypingPreview,
  memory: MemoryPreview,
  snake: SnakePreview,
  sokoban: SokobanPreview,
  go: GoPreview,
  "word-guess": WordGuessPreview,
  "red-cliffs": RedCliffsPreview,
  "bach-linh-ky": BachLinhKyPreview,
  "co-lau": CoLauPreview,
  nonogram: NonogramPreview,
};

/** The static board shown on a game's card, on /games and on the home page. */
export function GamePreview({ slug }: { slug: string }) {
  const Preview = PREVIEWS[slug];
  return Preview ? <Preview /> : null;
}
