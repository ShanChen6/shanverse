import * as React from "react";
import { BookOpenCheck, CircleAlert, Lightbulb, TrendingUp } from "lucide-react";

import { NotionRenderer } from "@/components/common/notion/renderer";
import { richTextValue } from "@/components/common/notion/table-of-contents";
import { NotionLightbox } from "@/components/common/notion/NotionLightbox";
import { notionMessages, type NotionLocale } from "@/components/common/notion/notion-messages";
import type { NotionContentBlock } from "@/types/notion";
import type { CaseStudy, CaseStudyKind } from "../case-study";

const CASE_STUDY_ICONS = {
  problem: CircleAlert,
  solution: Lightbulb,
  result: TrendingUp,
  lessons: BookOpenCheck,
} satisfies Record<CaseStudyKind, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>>;

/** A project page written with Problem / Solution / Result headings, shown as one card per section. */
export function CaseStudyView({ study, headingIds, title, locale }: { study: CaseStudy; headingIds: Map<string, string>; title: string; locale: NotionLocale }) {
  const render = (blocks: NotionContentBlock[]) => <NotionRenderer blocks={blocks} headingIds={headingIds} articleTitle={title} locale={locale} galleries lightbox={false} />;
  return (
    <NotionLightbox labels={notionMessages[locale]} className="space-y-8">
      {study.intro.length ? render(study.intro) : null}
      {study.sections.map((section) => {
        if (!section.kind) return <React.Fragment key={section.heading.id}>{render([section.heading, ...section.blocks])}</React.Fragment>;
        const Icon = CASE_STUDY_ICONS[section.kind];
        const id = headingIds.get(section.heading.id);
        return (
          <section
            key={section.heading.id}
            aria-labelledby={id}
            className={section.kind === "result" ? "rounded-card border border-primary/30 bg-primary/5 p-6" : "rounded-card border border-border bg-surface p-6"}
          >
            <h2 id={id} className="flex scroll-mt-24 items-center gap-3 text-xl font-semibold text-foreground">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden={true} className="size-5" /></span>
              {richTextValue(section.heading)}
            </h2>
            <div className="mt-4">{render(section.blocks)}</div>
          </section>
        );
      })}
    </NotionLightbox>
  );
}
