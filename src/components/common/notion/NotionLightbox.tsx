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
  const dragRef = React.useRef<{ id: number; x: number; y: number } | null>(null);
  const swipedRef = React.useRef(false);

  const open = (event: React.MouseEvent) => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-lightbox]");
    const root = rootRef.current;
    if (!trigger || !root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-lightbox]"));
    openerRef.current = trigger;
    setItems(nodes.map((node) => ({ src: node.dataset.src ?? "", alt: node.dataset.alt ?? "", caption: node.dataset.caption ?? "" })));
    setIndex(Math.max(0, nodes.indexOf(trigger)));
    setZoomed(false);
  };

  const go = (step: number) => {
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
                className="flex min-h-0 flex-1 overflow-auto px-3 pb-3 sm:px-16"
                // While zoomed the same gesture pans the picture, so swiping is only for the fitted view.
                style={{ touchAction: zoomed ? "auto" : "pan-y" }}
                onPointerDown={(event) => {
                  swipedRef.current = false;
                  dragRef.current = !zoomed && many ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
                }}
                onPointerUp={(event) => {
                  const start = dragRef.current;
                  dragRef.current = null;
                  if (!start || start.id !== event.pointerId) return;
                  const step = swipeStep(event.clientX - start.x, event.clientY - start.y);
                  if (step) {
                    swipedRef.current = true;
                    go(step);
                  }
                }}
                onPointerCancel={() => { dragRef.current = null; }}
                onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }}
              >
                {current ? (
                  <img
                    key={current.src}
                    src={current.src}
                    alt={current.alt}
                    draggable={false}
                    onClick={() => {
                      // A swipe also ends with a click on the picture; it must not toggle the zoom.
                      if (swipedRef.current) { swipedRef.current = false; return; }
                      setZoomed((value) => !value);
                    }}
                    className={cn("m-auto select-none rounded-lg", zoomed ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain")}
                  />
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
