import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const textareaVariants = cva(
  [
    "flex min-h-24 w-full rounded-lg border bg-background px-3 py-2",
    "text-sm text-foreground",
    "placeholder:text-muted",
    "transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary/35",
    "focus-visible:border-primary/50",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: {
      resize: "vertical",
    },
  },
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resize, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ resize }), className)}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
