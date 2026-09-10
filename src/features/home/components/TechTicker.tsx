import * as React from "react";

// Mock data: no API backs the tech ticker, it's purely decorative.
const TECH_STACK = [
  "TypeScript",
  "Next.js",
  "React",
  "Tailwind CSS",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "Docker",
  "Git",
];

export function TechTicker() {
  const items = [...TECH_STACK, ...TECH_STACK];

  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-surface/40 py-4">
      <div className="flex w-max animate-marquee gap-10">
        {items.map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            className="flex items-center gap-2 text-sm font-medium text-foreground-secondary whitespace-nowrap"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
