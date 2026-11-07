import type { ProjectHighlight } from "@/types/project";

const MAX_HIGHLIGHTS = 4;
const MAX_VALUE = 14;
const MAX_LABEL = 40;

/**
 * Reads the "Highlights" property of a project in Notion: one per line,
 * written as `value | label`, for example `98 | Lighthouse score`.
 * Lines without both parts, or that are too long, are skipped.
 */
export function parseHighlights(text: string | null | undefined): ProjectHighlight[] {
  if (!text) return [];
  const result: ProjectHighlight[] = [];
  for (const line of text.split(/\r?\n/u)) {
    const divider = line.indexOf("|");
    if (divider < 0) continue;
    const value = line.slice(0, divider).trim();
    const label = line.slice(divider + 1).trim();
    if (!value || !label || value.length > MAX_VALUE || label.length > MAX_LABEL) continue;
    result.push({ value, label });
    if (result.length === MAX_HIGHLIGHTS) break;
  }
  return result;
}
