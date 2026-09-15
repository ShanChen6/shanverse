import * as React from "react";

import { NotionBlock } from "./NotionBlock";
import type { NotionContentBlock } from "@/types/notion";
import type { NotionLocale } from "../notion-messages";

export function NotionRenderer({ blocks, headingIds, articleTitle, locale = "en" }: { blocks: NotionContentBlock[]; headingIds: Map<string, string>; articleTitle: string; locale?: NotionLocale }) {
  const renderBlocks = (entries: NotionContentBlock[]): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    for (let index = 0; index < entries.length;) {
      const block = entries[index];
      if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
        const type = block.type;
        const list: React.ReactNode[] = [];
        while (index < entries.length && entries[index].type === type) {
          const item = entries[index];
          list.push(<NotionBlock key={item.id} block={item} headingIds={headingIds} renderChildren={renderBlocks} articleTitle={articleTitle} locale={locale} />);
          index += 1;
        }
        const className = "space-y-2 pl-6 marker:text-primary";
        nodes.push(type === "bulleted_list_item" ? <ul key={`list-${block.id}`} className={`${className} list-disc`}>{list}</ul> : <ol key={`list-${block.id}`} className={`${className} list-decimal`}>{list}</ol>);
        continue;
      }
      nodes.push(<NotionBlock key={block.id} block={block} headingIds={headingIds} renderChildren={renderBlocks} articleTitle={articleTitle} locale={locale} />);
      index += 1;
    }
    return nodes;
  };

  return <div className="space-y-5 break-words text-base leading-8 text-foreground-secondary [overflow-wrap:anywhere]">{renderBlocks(blocks)}</div>;
}
