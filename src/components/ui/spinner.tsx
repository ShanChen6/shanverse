import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-2",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-7",
        xl: "size-9",
      },
      variant: {
        default: "border-primary/25 border-t-primary",
        secondary: "border-foreground/20 border-t-foreground",
        muted: "border-muted/35 border-t-muted",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export function Spinner({
  className,
  size,
  variant,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size, variant }), className)}
      {...props}
    />
  );
}
