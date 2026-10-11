// A static, decorative Snake board for the game card.
const SIZE = 12;
const SNAKE = [
  [7, 4], [6, 4], [5, 4], [4, 4], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7],
];
const FOOD = [9, 4];

export function SnakePreview() {
  const last = SNAKE.length - 1;
  return (
    <div aria-hidden="true" className="snake-wrap pointer-events-none mx-auto w-full max-w-60">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block aspect-square w-full rounded-xl" style={{ background: "var(--snake-board)" }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const x = i % SIZE;
          const y = Math.floor(i / SIZE);
          return (x + y) % 2 ? <rect key={i} x={x} y={y} width="1" height="1" fill="var(--snake-grid)" /> : null;
        })}
        <path
          d={`M${FOOD[0] + 0.5} ${FOOD[1] + 0.1} Q${FOOD[0] + 0.58} ${FOOD[1] + 0.42} ${FOOD[0] + 0.9} ${FOOD[1] + 0.5} Q${FOOD[0] + 0.58} ${FOOD[1] + 0.58} ${FOOD[0] + 0.5} ${FOOD[1] + 0.9} Q${FOOD[0] + 0.42} ${FOOD[1] + 0.58} ${FOOD[0] + 0.1} ${FOOD[1] + 0.5} Q${FOOD[0] + 0.42} ${FOOD[1] + 0.42} ${FOOD[0] + 0.5} ${FOOD[1] + 0.1}Z`}
          fill="var(--snake-food)"
        />
        {SNAKE.map(([x, y], i) => (
          <rect
            key={i}
            x={x + 0.1}
            y={y + 0.1}
            width="0.8"
            height="0.8"
            rx="0.25"
            fill={i === 0 ? "var(--snake-head)" : "var(--snake-body)"}
            opacity={i === 0 ? 1 : 1 - (i / last) * 0.45}
          />
        ))}
        <circle cx={SNAKE[0][0] + 0.68} cy={SNAKE[0][1] + 0.32} r="0.08" fill="var(--snake-eye)" />
        <circle cx={SNAKE[0][0] + 0.68} cy={SNAKE[0][1] + 0.68} r="0.08" fill="var(--snake-eye)" />
      </svg>
    </div>
  );
}
