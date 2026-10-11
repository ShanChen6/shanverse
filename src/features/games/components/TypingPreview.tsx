// A static, decorative typing test for the game card.
const LINE_ONE = "const speed = wpm * accuracy;";
const LINE_TWO = "return ship(speed);";
const TYPED = 22;
const WRONG = 9;

export function TypingPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto w-full max-w-72 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted">
        <span>
          <span className="text-base font-extrabold tracking-normal text-primary">87</span> WPM
        </span>
        <span>96%</span>
      </div>
      <p className="whitespace-pre font-mono text-[13px] leading-6">
        {Array.from(LINE_ONE).map((char, i) => (
          <span
            key={i}
            className={
              i === TYPED
                ? "typing-char typing-cursor text-muted/70"
                : i === WRONG
                  ? "rounded-sm bg-danger/15 text-danger"
                  : i < TYPED
                    ? "text-foreground"
                    : "text-muted/70"
            }
          >
            {char}
          </span>
        ))}
        {"\n"}
        <span className="text-muted/70">{LINE_TWO}</span>
      </p>
    </div>
  );
}
