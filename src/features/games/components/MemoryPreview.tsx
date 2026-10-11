import { TECH_CARD_BY_ID } from "@/features/games/memory/cards";

// A static, decorative memory board for the game card: some cards face up.
const LAYOUT = ["react", null, "typescript", null, null, "nextjs", null, "react", "tailwind", null, "typescript", null];

export function MemoryPreview() {
  return (
    <div aria-hidden="true" className="mem-grid mem-preview pointer-events-none mx-auto" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      {LAYOUT.map((id, index) => {
        const tech = id ? TECH_CARD_BY_ID.get(id) : undefined;
        return (
          <span key={index} className="mem-card" data-open={tech ? true : undefined} data-matched={id === "react" || id === "typescript" ? true : undefined}>
            <span className="mem-inner">
              <span className="mem-back">
                <img src="/logo/logo_shanverse.png" alt="" width={150} height={160} className="mem-back-logo" />
              </span>
              <span className="mem-face" style={tech ? { background: tech.background, color: tech.foreground } : undefined}>
                {tech ? <span className="mem-mark">{tech.mark}</span> : null}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}
