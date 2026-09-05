import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const inputVariants = cva(
  [
    "flex w-full rounded-lg border bg-background px-3 py-2",
    "text-sm text-foreground",
    "placeholder:text-muted",
    "transition-colors",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary/35",
    "focus-visible:border-primary/50",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ],
  {
    variants: {
      variant: {
        default: "border-border",
        ghost: "border-transparent bg-surface",
      },
      inputSize: {
        sm: "h-9",
        md: "h-10",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

export interface InputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ variant, inputSize, className }))}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
