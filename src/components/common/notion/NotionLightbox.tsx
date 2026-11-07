"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, ExternalLink, X, ZoomIn, ZoomOut } from "lucide-react";

import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

export type LightboxLabels = {
  imageViewer: string;
  closeImage: string;
  previousImage: string;
  nextImage: string;
  openOriginal: string;
  zoomIn: string;
  zoomOut: string;
};

type Item = { src: string; alt: string; caption: string };

const SWIPE_DISTANCE = 50;
// A swipe must be mostly sideways, so scrolling up or down never changes the image.
const SWIPE_DIRECTION_RATIO = 1.5;

/** Which way a finished drag moves through the images: 1 = next, -1 = previous, 0 = not a swipe. */
export function swipeStep(dx: number, dy: number): -1 | 0 | 1 {
  if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return 0;
  return dx < 0 ? 1 : -1;
}

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

/**
 * Wraps a Notion article. Clicking any image button inside it (marked `data-lightbox`) opens a viewer
 * that can step through every image of the article, zoom, and open the original file.
 */
export function NotionLightbox({ children, className, labels }: { children: React.ReactNode; className?: string; labels: LightboxLabels }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [items, setItems] = React.useState<Item[]>([]);
  const [index, setIndex] = React.useState<number | null>(null);
  const [zoomed, setZoomed] = React.useState(false);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const dragRef = React.useRef<{ id: number; x: number; y: number; locked: boolean } | null>(null);
  const swipedRef = React.useRef(false);
  // Horizontal offset of the picture while a finger drags it, and whether changes to it are animated.
  const [dragX, setDragX] = React.useState(0);
  const [settling, setSettling] = React.useState(false);
  const busyRef = React.useRef(false);
  const timersRef = React.useRef<number[]>([]);
  const areaRef = React.useRef<HTMLDivElement>(null);

  const later = (callback: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(callback, ms));
  };
  const resetDrag = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    busyRef.current = false;
    dragRef.current = null;
    setSettling(false);
    setDragX(0);
  };
  React.useEffect(() => () => timersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  const open = (event: React.MouseEvent) => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-lightbox]");
    const root = rootRef.current;
    if (!trigger || !root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-lightbox]"));
    resetDrag();
    openerRef.current = trigger;
    setItems(nodes.map((node) => ({ src: node.dataset.src ?? "", alt: node.dataset.alt ?? "", caption: node.dataset.caption ?? "" })));
    setIndex(Math.max(0, nodes.indexOf(trigger)));
    setZoomed(false);
  };

  const go = (step: number) => {
    resetDrag();
    setIndex((current) => (current === null ? current : (current + step + items.length) % items.length));
    setZoomed(false);
  };

  const current = index === null ? null : items[index];
  const many = items.length > 1;

  return (
    <div ref={rootRef} onClick={open} className={className}>
      {children}
      <Dialog open={index !== null} onOpenChange={(next) => { if (!next) setIndex(null); }}>
        <DialogPortal>
          <DialogOverlay className="bg-black/95" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            // No Dialog.Trigger is used, so give focus back to the image button that opened the viewer.
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              openerRef.current?.focus();
            }}
            onKeyDown={(event) => {
              if (!many) return;
              if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
              else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
            }}
            className="fixed inset-0 z-50 flex h-dvh w-screen flex-col text-white focus-visible:outline-none"
          >
            <DialogPrimitive.Title className="sr-only">{labels.imageViewer}{current?.alt ? `: ${current.alt}` : ""}</DialogPrimitive.Title>
            <div className="flex items-center justify-between gap-3 p-3">
              <p aria-live="polite" className="min-w-0 truncate text-sm font-medium tabular-nums">{many && index !== null ? `${index + 1} / ${items.length}` : ""}</p>
              <div className="flex items-center gap-2">
                {current ? (
                  <a href={current.src} target="_blank" rel="noopener noreferrer" aria-label={labels.openOriginal} title={labels.openOriginal} className={iconButton}>
                    <ExternalLink aria-hidden="true" className="size-5" />
                  </a>
                ) : null}
                <button type="button" onClick={() => setZoomed((value) => !value)} aria-pressed={zoomed} aria-label={zoomed ? labels.zoomOut : labels.zoomIn} title={zoomed ? labels.zoomOut : labels.zoomIn} className={iconButton}>
                  {zoomed ? <ZoomOut aria-hidden="true" className="size-5" /> : <ZoomIn aria-hidden="true" className="size-5" />}
                </button>
                <DialogPrimitive.Close aria-label={labels.closeImage} title={labels.closeImage} className={iconButton}>
                  <X aria-hidden="true" className="size-5" />
                </DialogPrimitive.Close>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1">
              <div
                ref={areaRef}
                className={cn("min-h-0 flex-1", zoomed ? "flex overflow-auto px-3 pb-3 sm:px-16" : "relative overflow-hidden")}
                // While zoomed the same gesture pans the picture, so swiping is only for the fitted view.
                style={{ touchAction: zoomed ? "auto" : "pan-y" }}
                onPointerDown={(event) => {
                  swipedRef.current = false;
                  if (zoomed || !many || busyRef.current) {
                    dragRef.current = null;
                    return;
                  }
                  dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, locked: false };
                }}
                onPointerMove={(event) => {
                  const start = dragRef.current;
                  if (!start || start.id !== event.pointerId) return;
                  const dx = event.clientX - start.x;
                  const dy = event.clientY - start.y;
                  if (!start.locked) {
                    // Wait until the gesture is clearly sideways before the picture follows the finger.
                    if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * SWIPE_DIRECTION_RATIO) return;
                    start.locked = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }
                  swipedRef.current = true;
                  setSettling(false);
                  setDragX(dx);
                }}
                onPointerUp={(event) => {
                  const start = dragRef.current;
                  dragRef.current = null;
                  if (!start || start.id !== event.pointerId || !start.locked) return;
                  const dx = event.clientX - start.x;
                  const step = swipeStep(dx, event.clientY - start.y);
                  if (!step) {
                    setSettling(true);
                    setDragX(0);
                    return;
                  }
                  const width = areaRef.current?.clientWidth ?? window.innerWidth;
                  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    go(step);
                    return;
                  }
                  // Slide the track one picture over, then swap the index: the neighbour that slid in is now the centre.
                  busyRef.current = true;
                  setSettling(true);
                  setDragX(-step * width);
                  later(() => {
                    setIndex((current) => (current === null ? current : (current + step + items.length) % items.length));
                    setSettling(false);
                    setDragX(0);
                    busyRef.current = false;
                  }, 190);
                }}
                onPointerCancel={() => {
                  if (dragRef.current?.locked) {
                    setSettling(true);
                    setDragX(0);
                  }
                  dragRef.current = null;
                }}
                onClick={(event) => {
                  // A drag ends with a click on the area itself; it must not close the viewer.
                  if (swipedRef.current) {
                    swipedRef.current = false;
                    return;
                  }
                  if (!(event.target as HTMLElement).closest("img")) setIndex(null);
                }}
              >
                {current && zoomed ? (
                  <img
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    draggable={false}
                    onClick={() => setZoomed(false)}
                    className="m-auto max-w-none cursor-zoom-out select-none rounded-lg"
                  />
                ) : null}
                {current && !zoomed ? (
                  <div
                    className="flex h-full"
                    style={{
                      // With several images the track holds previous, current and next side by side, current in the middle.
                      width: many ? "300%" : "100%",
                      marginLeft: many ? "-100%" : 0,
                      transform: dragX ? `translateX(${dragX}px)` : undefined,
                      transition: settling ? "transform 180ms ease-out" : "none",
                    }}
                  >
                    {(many
                      ? [
                          { role: "previous", item: items[(index! - 1 + items.length) % items.length] },
                          { role: "current", item: current },
                          { role: "next", item: items[(index! + 1) % items.length] },
                        ]
                      : [{ role: "current", item: current }]
                    ).map(({ role, item }) => (
                      <div key={role} className={cn("flex h-full shrink-0 items-center justify-center px-3 pb-3 sm:px-16", many ? "w-1/3" : "w-full")}>
                        <img
                          src={item.src}
                          alt={role === "current" ? item.alt : ""}
                          aria-hidden={role === "current" ? undefined : true}
                          draggable={false}
                          onClick={role === "current" ? () => setZoomed(true) : undefined}
                          className={cn("max-h-full max-w-full select-none rounded-lg object-contain", role === "current" && "cursor-zoom-in")}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {many ? (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label={labels.previousImage} className={cn(iconButton, "absolute left-2 top-1/2 -translate-y-1/2")}>
                    <ChevronLeft aria-hidden="true" className="size-6" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={labels.nextImage} className={cn(iconButton, "absolute right-2 top-1/2 -translate-y-1/2")}>
                    <ChevronRight aria-hidden="true" className="size-6" />
                  </button>
                </>
              ) : null}
            </div>

            {current?.caption ? <p className="px-4 pb-4 pt-1 text-center text-sm leading-6 text-white/85">{current.caption}</p> : <div className="pb-3" />}
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
