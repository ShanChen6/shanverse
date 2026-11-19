import * as React from "react";

import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small content on the right of the title, such as a count or a link. */
  actions?: React.ReactNode;
  titleId?: string;
  className?: string;
};

/** Shared page heading: the H1 and one line of description, with optional actions on the right. */
export function PageHeader({ title, description, actions, titleId, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl space-y-2">
        <h1 id={titleId} className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="text-pretty leading-relaxed text-foreground-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
