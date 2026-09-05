"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language,
  fileName,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-zinc-950 text-zinc-100",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <span className="font-medium">{fileName ?? "Code"}</span>
          {language ? (
            <span className="uppercase opacity-70">{language}</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          aria-label="Copy code block"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>

      <pre className="max-h-105 overflow-auto p-4 text-code">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
