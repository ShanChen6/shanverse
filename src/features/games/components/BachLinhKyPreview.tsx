import { Token } from "@/features/games/bach-linh-ky/art";

// A static, decorative corner of the board for the game card.
const PIECES: { cell: number; monster: string | null; level: number; side: 0 | 1 }[] = [
  { cell: 1, monster: null, level: 3, side: 1 },
  { cell: 3, monster: null, level: 5, side: 1 },
  { cell: 6, monster: "phuong-hoang", level: 4, side: 1 },
  { cell: 10, monster: null, level: 2, side: 1 },
  { cell: 19, monster: "son-tinh", level: 5, side: 0 },
  { cell: 21, monster: "thuy-tinh", level: 4, side: 1 },
  { cell: 25, monster: "lan", level: 2, side: 0 },
  { cell: 28, monster: "ho-tinh", level: 2, side: 0 },
  { cell: 30, monster: "kim-quy", level: 5, side: 0 },
];
const TERRAIN: Record<number, string> = { 4: "mountain", 12: "mountain", 13: "river", 14: "river", 22: "river", 17: "temple", 26: "shrine" };

export function BachLinhKyPreview() {
  return (
    <div aria-hidden="true" className="blk-board pointer-events-none mx-auto" style={{ ["--blk-cell" as string]: "2rem", height: "8rem" }}>
      <div className="blk-grid">
        {Array.from({ length: 32 }, (_, cell) => (
          <span key={cell} className="blk-cell" data-terrain={TERRAIN[cell] ?? "plain"} data-owner={TERRAIN[cell] === "temple" ? "0" : undefined}>
            {PIECES.filter((p) => p.cell === cell).map((p) => (
              <span key={p.cell} className="absolute inset-[7%]">
                <Token monsterId={p.monster} level={p.level} side={p.side} className="size-full" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
