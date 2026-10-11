import { Tianwu, TianwuTop } from "@/components/mascot/Tianwu";

// A static, decorative Sokoban board for the game card, with Tianwu beside it.
const MAP = ["  #####", "###   #", "#. @$ #", "# $ ..#", "#  *$ #", "#######"];

export function SokobanPreview() {
  const width = Math.max(...MAP.map((row) => row.length));
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto flex items-end gap-3">
      <div
        className="sk-board relative"
        style={{ "--sk-cols": width, "--sk-rows": MAP.length, "--sk-cell": "1.9rem" } as React.CSSProperties}
      >
        <div className="sk-grid">
          {MAP.flatMap((row, y) =>
            Array.from({ length: width }, (_, x) => {
              const ch = row[x] ?? " ";
              const outside = ch === " " && (y === 0 || x < row.indexOf("#"));
              const kind = ch === "#" ? "wall" : outside ? "space" : ch === "." || ch === "*" ? "goal" : "floor";
              return (
                <div key={`${x}-${y}`} className="sk-tile relative" data-kind={kind}>
                  {kind === "wall" ? <span className="absolute inset-[3px] rounded-md bg-[#3a4a6e]" /> : null}
                  {kind === "goal" ? <span className="absolute inset-[22%] rounded-full border-2 border-dashed border-[#D9AF62]" /> : null}
                  {ch === "$" || ch === "*" ? (
                    <span
                      className="absolute inset-[12%] rounded-md border-2"
                      style={{ background: ch === "*" ? "#D9AF62" : "#1D3A7D", borderColor: ch === "*" ? "#FFE6A6" : "#D9AF62" }}
                    />
                  ) : null}
                  {ch === "@" ? <TianwuTop facing="right" className="absolute inset-0 size-full p-[3px]" /> : null}
                </div>
              );
            }),
          )}
        </div>
      </div>
      <Tianwu pose="push" className="h-20 w-26 shrink-0" />
    </div>
  );
}
