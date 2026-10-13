import { Ship } from "@/features/games/red-cliffs/sprites";

// A static, decorative fleet for the game card: a few ships already burning.
const BOARD = [
  4, 2, 0, 3, 4, 1,
  1, 3, 4, 0, 2, 4,
  4, 0, 1, 4, 3, 2,
  3, 4, 2, 1, 0, 4,
];

export function RedCliffsPreview() {
  return (
    <div aria-hidden="true" className="rc-board pointer-events-none mx-auto max-w-64 p-1.5" style={{ width: "100%", height: "auto" }}>
      <div className="grid grid-cols-6">
        {BOARD.map((strength, i) => (
          <span key={i} className="aspect-square p-0.5">
            <Ship strength={strength} />
          </span>
        ))}
      </div>
    </div>
  );
}
