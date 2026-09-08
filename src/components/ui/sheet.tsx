"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const sheetContentVariants = cva(
  [
    "fixed z-50 gap-4 border border-border bg-surface-elevated p-6 shadow-xl",
    "transition duration-200",
    "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
  ],
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:-translate-y-6",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:translate-y-6",
        left: "inset-y-0 left-0 h-full w-[min(90vw,28rem)] border-r data-[state=closed]:-translate-x-6",
        right:
          "inset-y-0 right-0 h-full w-[min(90vw,28rem)] border-l data-[state=closed]:translate-x-6",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
      "transition-opacity duration-200",
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName =
  DialogPrimitive.Overlay.displayName || "SheetOverlay";

export interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(sheetContentVariants({ side }), className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));

SheetContent.displayName =
  DialogPrimitive.Content.displayName || "SheetContent";

function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));

SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground-secondary", className)}
    {...props}
  />
));

SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
