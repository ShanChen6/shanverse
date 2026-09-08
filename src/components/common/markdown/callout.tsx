import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const calloutVariants = cva(
  "rounded-xl border px-4 py-3 text-sm leading-relaxed",
  {
    variants: {
      variant: {
        info: "border-primary/30 bg-primary/10 text-foreground",
        success: "border-success/35 bg-success/10 text-foreground",
        warning: "border-warning/40 bg-warning/10 text-foreground",
        danger: "border-danger/35 bg-danger/10 text-foreground",
        neutral: "border-border bg-surface text-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

export interface CalloutProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof calloutVariants> {
  title?: string;
}

export function Callout({
  className,
  variant,
  title,
  children,
  ...props
}: CalloutProps) {
  return (
    <aside className={cn(calloutVariants({ variant }), className)} {...props}>
      {title ? <p className="mb-1 font-semibold">{title}</p> : null}
      <div>{children}</div>
    </aside>
  );
}
