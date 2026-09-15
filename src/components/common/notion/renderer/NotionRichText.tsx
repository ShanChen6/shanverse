import * as React from "react";

import { cn } from "@/lib/cn";
import type { NotionRichText } from "@/types/notion";

const colorClasses: Record<string, string> = {
  gray: "text-muted",
  brown: "text-accent",
  orange: "text-accent",
  purple: "text-primary",
  pink: "text-accent",
  blue: "text-primary",
  green: "text-success",
  yellow: "text-warning",
  red: "text-danger",
  gray_background: "bg-surface",
  brown_background: "bg-accent/10",
  orange_background: "bg-accent/10",
  purple_background: "bg-primary/10",
  pink_background: "bg-accent/10",
  blue_background: "bg-primary/10",
  green_background: "bg-success/10",
  yellow_background: "bg-warning/10",
  red_background: "bg-danger/10",
};

function safeHref(value: string | null): { href: string; external: boolean } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? { href: value, external: ["http:", "https:"].includes(url.protocol) }
      : null;
  } catch {
    return value.startsWith("/") && !value.startsWith("//")
      ? { href: value, external: false }
      : null;
  }
}

export function NotionRichText({ items }: { items: NotionRichText[] }) {
  return items.map((item, index) => {
    const className = cn(
      item.annotations.bold && "font-semibold",
      item.annotations.italic && "italic",
      item.annotations.underline && "underline underline-offset-2",
      item.annotations.strikethrough && "line-through",
      item.annotations.code &&
        "rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-primary",
      colorClasses[item.annotations.color],
    );
    const content = item.plainText.split("\n").map((line, lineIndex, lines) => (
      <React.Fragment key={lineIndex}>
        {line}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    ));
    const link = safeHref(item.href);
    return link ? (
      <a
        key={index}
        href={link.href}
        target={link.external ? "_blank" : undefined}
        rel={link.external ? "noopener noreferrer" : undefined}
        className={cn(className, "rounded-sm text-primary underline underline-offset-4 hover:no-underline")}
      >
        {content}
      </a>
    ) : (
      <span key={index} className={className}>{content}</span>
    );
  });
}
