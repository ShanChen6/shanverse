import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap",
    "rounded-lg",
    "font-medium",
    "transition-colors",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "select-none",
    "[&_svg]:pointer-events-none",
    // "[&_svg]:size-4",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        outline: "border border-border bg-background hover:bg-muted",

        ghost: "hover:bg-muted",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",

        md: "h-10 px-4 text-sm",

        lg: "h-11 px-6 text-base",

        xl: "h-12 px-8 text-base",

        icon: "size-10",
      },

      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",

      size: "md",
      fullWidth: false,
    },
  },
);

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  children,
  content,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    content?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {children ?? content}
    </Comp>
  );
}

export { Button, buttonVariants };
