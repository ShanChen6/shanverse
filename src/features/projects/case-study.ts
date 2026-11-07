import { richTextValue } from "@/components/common/notion/table-of-contents";
import type { NotionContentBlock } from "@/types/notion";

export type CaseStudyKind = "problem" | "solution" | "result" | "lessons";

// Heading texts, lower case and without accents, that mark a case-study section in a Notion page.
const KIND_NAMES: Record<CaseStudyKind, string[]> = {
  problem: ["van de", "problem", "the problem", "challenge", "challenges", "thach thuc", "bai toan"],
  solution: ["giai phap", "solution", "the solution", "approach", "cach lam", "cach giai quyet"],
  result: ["ket qua", "result", "results", "outcome", "outcomes", "impact", "tac dong"],
  lessons: ["bai hoc", "lessons", "lessons learned", "takeaways", "dieu hoc duoc"],
};

export function normalizeHeading(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/gu, "")
    .replace(/đ/gu, "d")
    .toLowerCase()
    .replace(/[:：.\s]+$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

export function caseStudyKind(heading: string): CaseStudyKind | null {
  const name = normalizeHeading(heading);
  for (const [kind, names] of Object.entries(KIND_NAMES) as [CaseStudyKind, string[]][]) {
    if (names.includes(name)) return kind;
  }
  return null;
}

export type CaseStudySection = {
  /** Set when the heading is one of the known names; other sections are shown plainly. */
  kind: CaseStudyKind | null;
  heading: NotionContentBlock;
  blocks: NotionContentBlock[];
};

export type CaseStudy = {
  /** Everything before the first heading. */
  intro: NotionContentBlock[];
  sections: CaseStudySection[];
};

/**
 * Splits a project page at its top-level "Heading 2" blocks. The result is a
 * case study only when at least two headings use the known names (Problem,
 * Solution, Result, Lessons); otherwise it returns null and the page is shown as is.
 */
export function splitCaseStudy(blocks: NotionContentBlock[]): CaseStudy | null {
  const intro: NotionContentBlock[] = [];
  const sections: CaseStudySection[] = [];
  for (const block of blocks) {
    if (block.type === "heading_2") {
      sections.push({ kind: caseStudyKind(richTextValue(block)), heading: block, blocks: [] });
    } else if (sections.length) {
      sections[sections.length - 1].blocks.push(block);
    } else {
      intro.push(block);
    }
  }
  const known = new Set(sections.map((section) => section.kind).filter(Boolean));
  return known.size >= 2 ? { intro, sections } : null;
}
