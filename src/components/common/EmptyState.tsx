import * as React from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <section
      role="status"
      className={cn(
        "rounded-2xl border border-dashed border-border bg-surface px-4 py-12 text-center sm:px-6 sm:py-16",
        className,
      )}
    >
      {icon ? <div aria-hidden="true" className="mx-auto mb-4 flex size-11 items-center justify-center text-primary">{icon}</div> : null}
      <h2 className="text-balance text-xl font-semibold wrap-anywhere sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-foreground-secondary wrap-anywhere">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap items-center justify-center gap-4">{action}</div> : null}
    </section>
  );
}
