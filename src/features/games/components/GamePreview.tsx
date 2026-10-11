import * as React from "react";

import { Game2048Preview } from "./Game2048Preview";
import { MemoryPreview } from "./MemoryPreview";
import { MinesweeperPreview } from "./MinesweeperPreview";
import { SnakePreview } from "./SnakePreview";
import { TypingPreview } from "./TypingPreview";

const PREVIEWS: Record<string, React.ComponentType> = {
  "2048": Game2048Preview,
  minesweeper: MinesweeperPreview,
  typing: TypingPreview,
  memory: MemoryPreview,
  snake: SnakePreview,
};

/** The static board shown on a game's card, on /games and on the home page. */
export function GamePreview({ slug }: { slug: string }) {
  const Preview = PREVIEWS[slug];
  return Preview ? <Preview /> : null;
}
