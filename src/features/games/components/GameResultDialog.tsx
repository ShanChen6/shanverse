import * as React from "react";

import { cn } from "@/lib/cn";

type GameResultDialogProps = {
  /** Optional: a panel that only shows a hint (e.g. "press Start") can leave it out. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Short line such as "New record!". */
  record?: React.ReactNode;
  /** Buttons. Give the main one `autoFocus`. */
  actions?: React.ReactNode;
  /** A picture (usually Tianwu) shown beside the text. Only for the `inline` variant. */
  media?: React.ReactNode;
  /** `win` uses the brand gradient for the title. */
  tone?: "default" | "win";
  /** `overlay` covers the board; `inline` is a card placed above or below it. */
  variant?: "overlay" | "inline";
  titleId?: string;
  className?: string;
  /** Extra lines between the description and the record, e.g. stars or a score table. */
  children?: React.ReactNode;
};

/**
 * Win, lose, pause or ready panel. It is not modal: keyboard play and the
 * rest of the page stay reachable, and the panel announces itself politely.
 */
export function GameResultDialog({ title, description, record, actions, media, tone = "default", variant = "overlay", titleId, className, children }: GameResultDialogProps) {
  const generated = React.useId();
  const id = titleId ?? generated;
  const overlay = variant === "overlay";
  const row = !overlay && Boolean(media);

  const text = (
    <>
      {title ? (
        <p id={id} className={cn("font-extrabold tracking-tight", overlay ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl", tone === "win" && "brand-gradient-text")}>{title}</p>
      ) : null}
      {description ? <p id={title ? undefined : id} className={cn("text-foreground-secondary", overlay ? "max-w-xs" : "max-w-sm text-sm", !overlay && !row && "mx-auto")}>{description}</p> : null}
      {children}
      {record ? <p className="text-sm font-semibold text-primary">{record}</p> : null}
    </>
  );

  return (
    <div
      role={overlay ? "group" : "status"}
      aria-labelledby={id}
      className={cn(
        overlay
          ? "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-[2px]"
          : "mx-auto w-full max-w-xl rounded-card border border-primary/30 bg-primary/5 p-4 sm:p-5",
        !overlay && (row ? "flex flex-wrap items-center gap-4 text-left sm:flex-nowrap" : "space-y-2 text-center"),
        className,
      )}
    >
      {row ? (
        <>
          <div className="shrink-0">{media}</div>
          <div className="min-w-0 flex-1 space-y-1">{text}</div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </>
      ) : (
        <>
          {text}
          {actions ? <div className={cn("flex flex-wrap justify-center gap-2", !overlay && "pt-2")}>{actions}</div> : null}
        </>
      )}
    </div>
  );
}
