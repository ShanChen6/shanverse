"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";

export function ShareArticleButton({ title, url }: { title: string; url: string }) {
  const [status, setStatus] = React.useState<"idle" | "copied" | "error">("idle");

  async function share() {
    setStatus("idle");
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={share} aria-label={`Share article: ${title}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
        {status === "copied" ? <Check aria-hidden="true" className="size-4" /> : <Share2 aria-hidden="true" className="size-4" />}
        {status === "copied" ? "Đã sao chép" : "Share article"}
      </button>
      {status === "error" ? <span role="status" className="text-sm text-danger">Không thể sao chép liên kết. Hãy thử lại.</span> : null}
    </div>
  );
}
