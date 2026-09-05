import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "children" | "size" | "aria-label"
> {
  icon: React.ReactNode;
  label: string;
}

export function IconButton({
  icon,
  label,
  className,
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
    <Button
      size="icon"
      variant={variant}
      className={cn("inline-flex", className)}
      aria-label={label}
      {...props}
    >
      {icon}
    </Button>
  );
}
