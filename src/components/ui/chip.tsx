import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * The one filter/choice chip of the site: a pill, 44px tall on touch screens, solid primary when selected.
 * Use `chipClassName` on elements that are not buttons (for example the label of a radio input).
 */
export function chipClassName(selected: boolean, className?: string) {
  return cn(
    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-10",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-surface text-foreground-secondary hover:border-primary/50 hover:text-foreground",
    className,
  );
}

type ChipProps = Omit<React.ComponentProps<"button">, "type"> & {
  selected?: boolean;
  /** Optional count shown after the label. */
  count?: React.ReactNode;
};

export function Chip({ selected = false, count, className, children, ...props }: ChipProps) {
  return (
    <button type="button" aria-pressed={selected} className={chipClassName(selected, className)} {...props}>
      {children}
      {count !== undefined && count !== null ? <span className="text-xs opacity-75">{count}</span> : null}
    </button>
  );
}
