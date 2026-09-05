import * as React from "react";
import { cn } from "@/lib/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
}

const headingLevelClasses: Record<HeadingLevel, string> = {
  1: "text-h1 mt-10 mb-4",
  2: "text-h2 mt-9 mb-4",
  3: "text-h3 mt-8 mb-3",
  4: "mt-7 mb-3 text-xl font-semibold",
  5: "mt-6 mb-2 text-lg font-semibold",
  6: "mt-6 mb-2 text-base font-semibold uppercase tracking-wide text-foreground-secondary",
};

export function Heading({
  as = 2,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${as}` as const;

  return (
    <Tag
      className={cn(
        "scroll-mt-24 text-foreground",
        headingLevelClasses[as],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
