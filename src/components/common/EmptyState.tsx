import * as React from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  /** Larger drawing (e.g. Tianwu) shown instead of the icon. */
  illustration?: React.ReactNode;
  /** Short line from the mascot, shown under the description. */
  note?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, illustration, note, title, description, action, className }: EmptyStateProps) {
  return (
    <section
      role="status"
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface px-4 py-12 text-center sm:px-6 sm:py-16",
        className,
      )}
    >
      {illustration ? <div className="mx-auto mb-5 w-32 sm:w-36">{illustration}</div> : icon ? <div aria-hidden="true" className="mx-auto mb-4 flex size-11 items-center justify-center text-primary">{icon}</div> : null}
      <h2 className="text-balance text-xl font-semibold wrap-anywhere sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-foreground-secondary wrap-anywhere">{description}</p>
      {note ? <p className="mx-auto mt-3 max-w-md text-pretty text-sm italic text-primary wrap-anywhere">{note}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap items-center justify-center gap-4">{action}</div> : null}
    </section>
  );
}
