"use client";

import * as React from "react";

const CONTENT_SELECTOR = "[data-blog-content]";

export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const content = document.querySelector<HTMLElement>(CONTENT_SELECTOR);
    if (!content) return;

    let frame: number | null = null;
    let lastProgress = -1;

    const update = () => {
      frame = null;
      const rect = content.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const headerOffset = window.matchMedia("(min-width: 768px)").matches ? 64 : 0;
      const start = articleTop - headerOffset;
      const end = articleTop + rect.height - window.innerHeight;
      const scrollRange = end - start;
      const nextProgress = scrollRange <= 0
        ? (window.scrollY >= start ? 1 : 0)
        : Math.min(1, Math.max(0, (window.scrollY - start) / scrollRange));

      if (Math.abs(nextProgress - lastProgress) >= 0.001 || nextProgress === 0 || nextProgress === 1) {
        lastProgress = nextProgress;
        setProgress(nextProgress);
      }
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(content);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 bg-transparent md:top-16">
      <div
        className="h-full w-full origin-left bg-primary transition-transform duration-100 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
