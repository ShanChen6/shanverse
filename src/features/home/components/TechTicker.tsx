import * as React from "react";

import { HOME_TECH_STACK } from "../home.data";

function TickerItems({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate ? "true" : undefined}
      className={duplicate ? "tech-ticker-group tech-ticker-copy" : "tech-ticker-group"}
    >
      {HOME_TECH_STACK.map((technology) => (
        <li
          key={technology}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground-secondary"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
          {technology}
        </li>
      ))}
    </ul>
  );
}

export function TechTicker() {
  return (
    <section
      aria-label="Technologies I work with"
      className="border-y border-border bg-surface/60 py-4"
    >
      <div className="tech-ticker-mask overflow-hidden">
        <div className="tech-ticker-track flex w-max">
          <TickerItems />
          <TickerItems duplicate />
        </div>
      </div>
    </section>
  );
}
