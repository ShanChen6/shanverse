import * as React from "react";

import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-control bg-muted/35 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
