"use client";

import * as React from "react";
import { Code2, ExternalLink } from "lucide-react";

import { cn } from "@/lib/cn";

type Props = {
  /** Id of the element holding the main buttons. The bar shows once that element has scrolled above the screen. */
  targetId: string;
  liveUrl: string | null;
  githubUrl: string | null;
  liveLabel: string;
  sourceLabel: string;
  groupLabel: string;
};

/** Demo / source buttons pinned above the mobile bottom bar once the page header has scrolled away. */
export function ProjectActionBar({ targetId, liveUrl, githubUrl, liveLabel, sourceLabel, groupLabel }: Props) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      // Only when the buttons left through the top; never while they are still below the screen.
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const link = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary";
  return (
    <div
      role="group"
      aria-label={groupLabel}
      hidden={!visible}
      className={cn(
        "fixed inset-x-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 backdrop-blur-md md:hidden",
        "bottom-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom))]",
      )}
    >
      {liveUrl ? (
        <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={cn(link, "bg-primary text-primary-foreground hover:opacity-90")}>
          <ExternalLink aria-hidden="true" className="size-4" /> {liveLabel}
        </a>
      ) : null}
      {githubUrl ? (
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={cn(link, "border border-border bg-surface hover:border-primary/50")}>
          <Code2 aria-hidden="true" className="size-4" /> {sourceLabel}
        </a>
      ) : null}
    </div>
  );
}
