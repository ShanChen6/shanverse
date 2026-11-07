import * as React from "react";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** Icon shown before the eyebrow text. */
  icon?: React.ReactNode;
  /** Buttons or links under the description. */
  actions?: React.ReactNode;
  /** `hero` is the bordered gradient panel; `plain` is a bare heading block. */
  variant?: "hero" | "plain";
  titleId?: string;
  className?: string;
};

/** Shared page heading: eyebrow, H1, description and optional actions. */
export function PageHeader({ title, description, eyebrow, icon, actions, variant = "hero", titleId, className }: PageHeaderProps) {
  const hero = variant === "hero";
  return (
    <header
      className={cn(
        hero && "relative overflow-hidden rounded-panel border border-border bg-linear-to-br from-primary/10 via-surface to-background p-6 sm:p-10 lg:p-12",
        className,
      )}
    >
      {hero ? (
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/10 sm:size-96" />
      ) : null}
      <div className="relative max-w-3xl space-y-6">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary">
            {icon ? <span aria-hidden="true" className="inline-flex size-4 items-center justify-center [&>svg]:size-4">{icon}</span> : null}
            {eyebrow}
          </p>
        ) : null}
        <h1 id={titleId} className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
        {description ? <p className="max-w-2xl text-pretty leading-relaxed text-foreground-secondary sm:text-lg">{description}</p> : null}
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
