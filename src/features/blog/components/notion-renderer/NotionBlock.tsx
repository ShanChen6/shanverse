import * as React from "react";

import { MermaidDiagram, NotionCallout, NotionImage } from "@/components/common/notion";
import { notionMessages, type NotionLocale } from "@/features/blog/notion-messages";
import { HighlightedCodeBlock } from "./HighlightedCodeBlock";
import { NotionRichText } from "./NotionRichText";
import type { NotionContentBlock } from "@/types/notion";

type Props = {
  block: NotionContentBlock;
  headingIds: Map<string, string>;
  renderChildren: (blocks: NotionContentBlock[]) => React.ReactNode;
  articleTitle: string;
  locale: NotionLocale;
};

function safeWebUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

export function NotionBlock({ block, headingIds, renderChildren, articleTitle, locale }: Props) {
  const text = <NotionRichText items={block.richText} />;
  const children = block.children.length ? (
    <div className="mt-3 pl-4 sm:pl-6">{renderChildren(block.children)}</div>
  ) : null;

  switch (block.type) {
    case "paragraph":
      return <div><p className="min-h-6">{text}</p>{children}</div>;
    case "heading_1":
      return <h2 className="scroll-mt-28 pt-5 text-3xl font-bold tracking-tight">{text}</h2>;
    case "heading_2":
      return <h2 id={headingIds.get(block.id)} className="scroll-mt-28 pt-5 text-2xl font-semibold tracking-tight">{text}</h2>;
    case "heading_3":
      return <h3 id={headingIds.get(block.id)} className="scroll-mt-28 pt-3 text-xl font-semibold tracking-tight">{text}</h3>;
    case "bulleted_list_item":
    case "numbered_list_item":
      return <li className="pl-1">{text}{children}</li>;
    case "to_do":
      return <div className="flex items-start gap-3"><input type="checkbox" checked={block.checked ?? false} readOnly aria-label="Task status" className="mt-1 size-4 accent-primary" /><div className={block.checked ? "text-muted line-through" : undefined}>{text}{children}</div></div>;
    case "quote":
      return <blockquote className="border-l-4 border-primary/40 bg-primary/5 px-5 py-3 italic text-foreground-secondary">{text}{children}</blockquote>;
    case "callout":
      return <NotionCallout color={block.color} icon={block.icon ?? null} warningLabel={notionMessages[locale].warning} noteLabel={notionMessages[locale].note}><NotionRichText items={block.richText} />{children}</NotionCallout>;
    case "code": {
      const code = block.code ?? block.richText.map((item) => item.plainText).join("");
      const caption = block.caption?.map((item) => item.plainText).join("") || undefined;
      return block.language?.trim().toLowerCase() === "mermaid"
        ? <MermaidDiagram code={code} caption={caption} locale={locale} />
        : <HighlightedCodeBlock code={code} language={block.language} fileName={caption} locale={locale} />;
    }
    case "image": {
      const caption = block.caption ?? [];
      const alt = caption.map((item) => item.plainText).join("").trim() || `${articleTitle} illustration`;
      return <NotionImage url={block.url ?? ""} caption={caption} alt={alt} errorLabel={notionMessages[locale].imageError} />;
    }
    case "divider":
      return <hr className="my-8 border-border" />;
    case "bookmark": {
      const url = safeWebUrl(block.url);
      return url ? <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-border bg-surface p-4 font-medium text-primary hover:border-primary/40"><span className="break-all">{block.caption?.length ? <NotionRichText items={block.caption} /> : url}</span> ↗</a> : null;
    }
    case "toggle":
      return <details className="rounded-xl border border-border bg-surface px-4 py-3"><summary className="cursor-pointer font-medium">{text}</summary>{children}</details>;
    default:
      return children;
  }
}
