// A static, decorative 2048 board for the game card.
const PREVIEW = [
  [2, 0, 4, 0],
  [0, 16, 8, 2],
  [4, 64, 256, 32],
  [128, 512, 1024, 2048],
];

export function Game2048Preview() {
  return (
    <div aria-hidden="true" data-preview="true" className="g2048-board pointer-events-none mx-auto max-w-64">
      <div className="g2048-layer">
        {PREVIEW.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="g2048-slot"
              style={{ transform: `translate(${colIndex * 100}%, ${rowIndex * 100}%)` }}
            >
              {value ? (
                <div
                  className="g2048-tile"
                  data-value={value}
                  data-digits={String(value).length}
                >
                  {value}
                </div>
              ) : (
                <div className="g2048-cell" />
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
