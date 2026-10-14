import { parsePicture } from "@/features/games/nonogram/logic";
import { PICTURES } from "@/features/games/nonogram/pictures";

// A static, decorative board for the game card: the turtle picture, half
// painted, with a few crosses, and its clues faded where a line is done.
const picture = parsePicture(PICTURES.find((entry) => entry.id === "turtle")!.rows);
const PAINTED_ROWS = 6;

export function NonogramPreview() {
  const { width, height, cells } = picture;
  return (
    <svg viewBox={`-0.2 -0.2 ${width + 0.4} ${height + 0.4}`} aria-hidden="true" className="pointer-events-none mx-auto h-full max-h-60 w-auto" shapeRendering="crispEdges">
      <rect x="0" y="0" width={width} height={height} fill="var(--surface)" />
      {cells.map((filled, i) => {
        const x = i % width;
        const y = Math.floor(i / width);
        if (y >= PAINTED_ROWS) return null;
        if (filled) return <rect key={i} x={x} y={y} width="1" height="1" fill="var(--foreground)" />;
        return (x + y) % 3 === 0 ? (
          <path key={i} d={`M${x + 0.3} ${y + 0.3} L${x + 0.7} ${y + 0.7} M${x + 0.7} ${y + 0.3} L${x + 0.3} ${y + 0.7}`} stroke="var(--muted)" strokeWidth="0.08" />
        ) : null;
      })}
      {Array.from({ length: width + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i} y1="0" x2={i} y2={height} stroke="var(--border)" strokeWidth={i % 5 === 0 ? 0.08 : 0.03} />
      ))}
      {Array.from({ length: height + 1 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i} x2={width} y2={i} stroke="var(--border)" strokeWidth={i % 5 === 0 ? 0.08 : 0.03} />
      ))}
    </svg>
  );
}
