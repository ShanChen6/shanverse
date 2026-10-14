import type * as React from "react";

import { Piece, Pips } from "@/features/games/red-cliffs/pieces";

// A static, decorative board for the game card: river lanterns, some lit.
const BOARD = [
  4, 2, 0, 3, 4, 1,
  1, 3, 4, 0, 2, 4,
  4, 0, 1, 4, 3, 2,
  3, 4, 2, 1, 0, 4,
];

export function RedCliffsPreview() {
  return (
    <div aria-hidden="true" className="rc-board pointer-events-none mx-auto max-w-64 p-1.5" data-theme="lantern" style={{ width: "100%", height: "auto" }}>
      <div className="grid grid-cols-6">
        {BOARD.map((strength, i) => (
          <span key={i} className="relative aspect-square p-0.5 pb-1.5" style={{ "--rc-cell": "2.4rem" } as React.CSSProperties}>
            <Piece theme="lantern" strength={strength} />
            <Pips strength={strength} />
          </span>
        ))}
      </div>
    </div>
  );
}
