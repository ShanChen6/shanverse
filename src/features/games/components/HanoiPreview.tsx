import { Tianwu } from "@/components/mascot/Tianwu";

// A static, decorative tower for the game card: a game in progress, with Tianwu beside it.
const PEGS = [[5, 4], [2, 1], [3]];

export function HanoiPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto flex items-end gap-3">
      <div className="hn-board hn-preview" style={{ "--hn-disks": 5 } as React.CSSProperties}>
        {PEGS.map((disks, peg) => (
          <span key={peg} className="hn-peg">
            <span className="hn-rod" />
            <span className="hn-stack">
              {disks.map((size) => (
                <span key={size} className="hn-disk" style={{ "--hn-size": size, "--hn-hue": (size - 1) / 4 } as React.CSSProperties} />
              ))}
            </span>
            <span className="hn-base" />
          </span>
        ))}
      </div>
      <Tianwu pose="stand" className="h-20 w-16 shrink-0" />
    </div>
  );
}
