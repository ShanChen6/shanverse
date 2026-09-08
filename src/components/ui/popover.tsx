"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/cn";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl border border-border bg-surface-elevated p-4 text-foreground shadow-xl",
        "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
        "transition-opacity duration-150",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName =
  PopoverPrimitive.Content.displayName || "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
