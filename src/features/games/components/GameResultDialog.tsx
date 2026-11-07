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
  /** `win` uses the brand gradient for the title. */
  tone?: "default" | "win";
  /** `overlay` covers the board; `inline` is a card placed above it. */
  variant?: "overlay" | "inline";
  titleId?: string;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Win, lose, pause or ready panel. It is not modal: keyboard play and the
 * rest of the page stay reachable, and the panel announces itself politely.
 */
export function GameResultDialog({ title, description, record, actions, tone = "default", variant = "overlay", titleId, className, children }: GameResultDialogProps) {
  const id = titleId ?? React.useId();
  return (
    <div
      role={variant === "overlay" ? "group" : "status"}
      aria-labelledby={id}
      className={cn(
        variant === "overlay"
          ? "absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-[2px]"
          : "mx-auto max-w-md rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center",
        className,
      )}
    >
      {title ? <p id={id} className={cn("text-2xl font-extrabold tracking-tight sm:text-3xl", tone === "win" && "brand-gradient-text")}>{title}</p> : null}
      {description ? <p id={title ? undefined : id} className="max-w-xs text-foreground-secondary">{description}</p> : null}
      {children}
      {record ? <p className="text-sm font-semibold text-primary">{record}</p> : null}
      {actions ? <div className="mt-1 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
