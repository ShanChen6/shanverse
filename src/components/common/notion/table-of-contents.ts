import type { NotionContentBlock } from "@/types/notion";

export type TableOfContentsItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function richTextValue(block: NotionContentBlock): string {
  return block.richText.map((item) => item.plainText).join("");
}

function headingSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";
}

export function createTableOfContents(blocks: NotionContentBlock[]) {
  const seen = new Map<string, number>();
  const headingIds = new Map<string, string>();
  const items: TableOfContentsItem[] = [];

  const visit = (entries: NotionContentBlock[]) => {
    for (const block of entries) {
      if (block.type === "heading_2" || block.type === "heading_3") {
        const text = richTextValue(block).trim();
        if (text) {
          const base = headingSlug(text);
          const occurrence = (seen.get(base) ?? 0) + 1;
          seen.set(base, occurrence);
          const id = occurrence === 1 ? base : `${base}-${occurrence}`;
          headingIds.set(block.id, id);
          items.push({ id, text, level: block.type === "heading_2" ? 2 : 3 });
        }
      }
      visit(block.children);
    }
  };
  visit(blocks);
  return { items, headingIds };
}
