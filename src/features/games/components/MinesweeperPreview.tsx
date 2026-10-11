// A static, decorative Minesweeper board for the game card.
// h = hidden, f = flag, 0-8 = opened number.
const PREVIEW = [
  "000111hh",
  "0001f2hh",
  "11012fhh",
  "f10011hh",
  "110011hh",
  "00001fhh",
  "00001hhh",
];

export function MinesweeperPreview() {
  return (
    <div
      aria-hidden="true"
      data-preview="true"
      className="ms-board pointer-events-none mx-auto"
      style={{ gridTemplateColumns: `repeat(${PREVIEW[0].length}, var(--ms-cell))` }}
    >
      {PREVIEW.flatMap((row, r) =>
        row.split("").map((value, c) => {
          const key = `${r}-${c}`;
          if (value === "h") return <span key={key} className="ms-cell" data-state="hidden" />;
          if (value === "f")
            return (
              <span key={key} className="ms-cell" data-state="flagged">
                <svg viewBox="0 0 24 24" className="size-[62%] text-[var(--ms-flag)]">
                  <path d="M6 21V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor" />
                </svg>
              </span>
            );
          return (
            <span key={key} className="ms-cell" data-state="revealed" data-n={value}>
              {value === "0" ? null : value}
            </span>
          );
        }),
      )}
    </div>
  );
}
