import { TianwuBadge } from "@/components/mascot/Tianwu";

// A static, decorative 9×9 Go board for the game card.
const STONES: Array<[number, number, 1 | 2]> = [
  [2, 2, 1], [6, 2, 2], [4, 4, 1], [5, 4, 2], [5, 5, 1], [3, 5, 2], [2, 6, 1], [6, 6, 2], [4, 3, 2], [3, 4, 1], [6, 5, 2],
];

export function GoPreview() {
  const size = 9;
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto flex items-end gap-3">
      <svg viewBox={`0 0 ${size + 1} ${size + 1}`} className="go-board size-44 rounded-xl">
        <rect width={size + 1} height={size + 1} rx="0.4" fill="var(--go-wood)" />
        {Array.from({ length: size }, (_, i) => (
          <g key={i} stroke="var(--go-line)" strokeWidth="0.04">
            <line x1={1} y1={i + 1} x2={size} y2={i + 1} />
            <line x1={i + 1} y1={1} x2={i + 1} y2={size} />
          </g>
        ))}
        {[[3, 3], [7, 3], [5, 5], [3, 7], [7, 7]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="0.1" fill="var(--go-line)" />
        ))}
        {STONES.map(([x, y, c]) => (
          <circle key={`${x}-${y}`} cx={x + 1} cy={y + 1} r="0.46" fill={c === 1 ? "#121A33" : "#F7F3EA"} stroke={c === 1 ? "#0A1024" : "#9C9481"} strokeWidth="0.04" />
        ))}
        <circle cx={6} cy={6} r="0.2" fill="none" stroke="#F0C27B" strokeWidth="0.07" />
      </svg>
      <TianwuBadge className="size-16 shrink-0" />
    </div>
  );
}
