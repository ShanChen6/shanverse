// A static, decorative word-guess card for the game card: a question with
// two hints open and three still locked.
const OPEN = ["Nó có hai bánh.", "Gần như nhà nào cũng có một chiếc."];

export function WordGuessPreview() {
  return (
    <div aria-hidden="true" className="pointer-events-none mx-auto w-full max-w-72 space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">?</p>
      <p className="text-[13px] font-bold leading-snug">Phương tiện nào khiến phố giờ cao điểm như một dòng sông?</p>
      {OPEN.map((hint, i) => (
        <p key={i} className="flex items-center gap-2 rounded-lg border border-[#D9AF62]/50 bg-[#D9AF62]/10 px-2 py-1 text-[11px]">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#D9AF62] text-[9px] font-bold text-[#031242]">{i + 1}</span>
          {hint}
        </p>
      ))}
      {[3, 4, 5].map((n) => (
        <p key={n} className="h-6 rounded-lg border border-dashed border-border" />
      ))}
      <p className="flex items-center gap-2 pt-1">
        <span className="h-7 flex-1 rounded-lg border border-border bg-background px-2 text-[11px] leading-7 text-muted">
          xe ma<span className="typing-cursor">|</span>
        </span>
        <span className="rounded-lg bg-primary px-2.5 text-[11px] font-semibold leading-7 text-primary-foreground">↵</span>
      </p>
    </div>
  );
}
