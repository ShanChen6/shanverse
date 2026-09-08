"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const drawerContentVariants = cva(
  [
    "fixed z-50 border border-border bg-surface-elevated p-4 shadow-xl",
    "transition duration-200",
    "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
  ],
  {
    variants: {
      direction: {
        bottom:
          "inset-x-0 bottom-0 rounded-t-2xl border-t data-[state=closed]:translate-y-6",
        top: "inset-x-0 top-0 rounded-b-2xl border-b data-[state=closed]:-translate-y-6",
        left: "inset-y-0 left-0 h-full w-[min(95vw,24rem)] rounded-r-2xl border-r data-[state=closed]:-translate-x-6",
        right:
          "inset-y-0 right-0 h-full w-[min(95vw,24rem)] rounded-l-2xl border-l data-[state=closed]:translate-x-6",
      },
    },
    defaultVariants: {
      direction: "bottom",
    },
  },
);

const Drawer = DialogPrimitive.Root;
const DrawerTrigger = DialogPrimitive.Trigger;
const DrawerPortal = DialogPrimitive.Portal;
const DrawerClose = DialogPrimitive.Close;

const DrawerOverlay = React.forwardRef<
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
DrawerOverlay.displayName = "DrawerOverlay";

export interface DrawerContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {}

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ direction = "bottom", className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(drawerContentVariants({ direction }), className)}
      {...props}
    >
      <div
        className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border"
        aria-hidden="true"
      />
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName =
  DialogPrimitive.Content.displayName || "DrawerContent";

function DrawerHeader({
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

function DrawerFooter({
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

const DrawerTitle = React.forwardRef<
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
DrawerTitle.displayName = DialogPrimitive.Title.displayName || "DrawerTitle";

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground-secondary", className)}
    {...props}
  />
));
DrawerDescription.displayName =
  DialogPrimitive.Description.displayName || "DrawerDescription";

export {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerClose,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
