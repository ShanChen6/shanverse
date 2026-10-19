import { TianwuBadge } from "@/components/mascot/Tianwu";

// A static, decorative 8×5 corner of the board for the game card, one colour per tile kind.
const COLORS = ["#E8C547", "#4CAF50", "#3B82F6", "#EF4444", "#A16207", "#A855F7", "#14B8A6"];
const BOARD = [
  0, 3, 3, 1, 5, 2, 6, 4,
  2, 1, 6, 3, 0, 4, 1, 5,
  4, 6, 0, 2, 2, 5, 2, 0,
  1, 5, 4, 6, 3, 0, 6, 3,
  3, 0, 2, 5, 1, 4, 1, 6,
];

export function CoLauPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto flex items-end gap-3">
      <div className="grid w-52 grid-cols-8 gap-0.5 rounded-xl bg-black/20 p-1">
        {BOARD.map((element, i) => (
          <span key={i} className="aspect-square rounded-sm" style={{ backgroundColor: COLORS[element] }} />
        ))}
      </div>
      <TianwuBadge className="size-14 shrink-0" />
    </div>
  );
}
