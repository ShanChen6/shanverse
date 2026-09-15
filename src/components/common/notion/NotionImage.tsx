"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import type { NotionRichText } from "@/types/notion";
import { NotionRichText as RichText } from "@/features/blog/components/notion-renderer/NotionRichText";

function safeWebUrl(value: string): string | null {
  try { const parsed = new URL(value); return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null; } catch { return null; }
}

export function NotionImage({ url, caption, alt, errorLabel }: { url: string; caption: NotionRichText[]; alt: string; errorLabel: string }) {
  const safeUrl = safeWebUrl(url);
  const [failed, setFailed] = React.useState(!safeUrl);
  if (failed || !safeUrl) return <div role="img" aria-label={errorLabel} className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-muted"><ImageOff aria-hidden="true" className="size-8" /><span className="text-sm">{errorLabel}</span></div>;
  return <figure className="overflow-hidden rounded-2xl border border-border bg-surface"><a href={safeUrl} target="_blank" rel="noopener noreferrer" aria-label={`${alt} — open full size`} className="block bg-surface-elevated focus-visible:ring-2 focus-visible:ring-primary">{/* Notion file URLs are short-lived; native img avoids optimizer caching them beyond the page cache. */}<img src={safeUrl} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-auto max-h-[75vh] w-full object-contain" /></a>{caption.length ? <figcaption className="border-t border-border px-4 py-3 text-center text-sm leading-6 text-foreground-secondary"><RichText items={caption} /></figcaption> : null}</figure>;
}
