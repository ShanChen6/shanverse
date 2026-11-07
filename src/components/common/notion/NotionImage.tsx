"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { safeImageSource } from "@/lib/notion-media";
import type { NotionRichText } from "@/types/notion";
import { NotionRichText as RichText } from "./renderer/NotionRichText";

export function NotionImage({ url, caption, alt, errorLabel, enlargeLabel }: { url: string; caption: NotionRichText[]; alt: string; errorLabel: string; enlargeLabel: string }) {
  const safeUrl = safeImageSource(url);
  const [failed, setFailed] = React.useState(!safeUrl);
  if (failed || !safeUrl) return <div role="img" aria-label={errorLabel} className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-muted"><ImageOff aria-hidden="true" className="size-8" /><span className="text-sm">{errorLabel}</span></div>;
  return <figure className="overflow-hidden rounded-2xl border border-border bg-surface"><button type="button" data-lightbox data-src={safeUrl} data-alt={alt} data-caption={caption.map((item) => item.plainText).join("").trim()} aria-haspopup="dialog" aria-label={`${alt} — ${enlargeLabel}`} className="block w-full cursor-zoom-in bg-surface-elevated focus-visible:ring-2 focus-visible:ring-primary">{/* Uploaded Notion images arrive as stable /api/notion-media URLs; external images keep their own URL. */}<img src={safeUrl} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-auto max-h-[75vh] w-full object-contain" /></button>{caption.length ? <figcaption className="border-t border-border px-4 py-3 text-center text-sm leading-6 text-foreground-secondary"><RichText items={caption} /></figcaption> : null}</figure>;
}
