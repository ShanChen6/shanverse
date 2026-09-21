"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

type AutoHideScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "both";
  hideDelay?: number;
  viewportClassName?: string;
};

const orientationClasses = {
  vertical: "overflow-x-hidden overflow-y-auto",
  horizontal: "overflow-x-auto overflow-y-hidden",
  both: "overflow-auto",
} as const;

export const AutoHideScrollArea = React.forwardRef<
  HTMLDivElement,
  AutoHideScrollAreaProps
>(function AutoHideScrollArea(
  {
    orientation = "vertical",
    hideDelay = 1600,
    viewportClassName,
    className,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onFocus,
    onBlur,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredRef = React.useRef(false);
  const focusedRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const [visible, setVisible] = React.useState(false);

  React.useImperativeHandle(forwardedRef, () => viewportRef.current!, []);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = React.useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      if (!hoveredRef.current && !focusedRef.current && !draggingRef.current) {
        setVisible(false);
      }
    }, hideDelay);
  }, [clearHideTimer, hideDelay]);

  const showScrollbar = React.useCallback(
    (schedule = true) => {
      setVisible(true);
      if (schedule) scheduleHide();
      else clearHideTimer();
    },
    [clearHideTimer, scheduleHide],
  );

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => showScrollbar();
    const handlePointerEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      scheduleHide();
    };
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("pointerup", handlePointerEnd);
    document.addEventListener("pointercancel", handlePointerEnd);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      document.removeEventListener("pointerup", handlePointerEnd);
      document.removeEventListener("pointercancel", handlePointerEnd);
      clearHideTimer();
    };
  }, [clearHideTimer, scheduleHide, showScrollbar]);

  return (
    <div
      ref={viewportRef}
      data-scrollbar-visible={visible ? "true" : "false"}
      className={cn(
        "auto-hide-scrollbar overscroll-contain",
        orientationClasses[orientation],
        viewportClassName,
        className,
      )}
      onPointerEnter={(event) => {
        hoveredRef.current = true;
        showScrollbar(false);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        hoveredRef.current = false;
        scheduleHide();
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        draggingRef.current = true;
        showScrollbar(false);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        scheduleHide();
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        draggingRef.current = false;
        scheduleHide();
        onPointerCancel?.(event);
      }}
      onFocus={(event) => {
        focusedRef.current = true;
        showScrollbar(false);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focusedRef.current = false;
          scheduleHide();
        }
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (
          ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
            event.key,
          )
        ) {
          showScrollbar();
        }
        onKeyDown?.(event);
      }}
      {...props}
    />
  );
});
