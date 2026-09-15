"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

export function CopyCodeButton({ code, copyLabel = "Copy", copiedLabel = "Copied" }: { code: string; copyLabel?: string; copiedLabel?: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary" aria-label={`${copyLabel} code`}>
      {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Copy aria-hidden="true" className="size-3.5" />}
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
