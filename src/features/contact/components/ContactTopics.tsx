import * as React from "react";
import { BriefcaseBusiness, Code2, Lightbulb, MessageSquareText } from "lucide-react";
import { getTranslator } from "@/i18n/server";

const topics = [
  { key: "frontendRole", icon: BriefcaseBusiness },
  { key: "product", icon: Lightbulb },
  { key: "stack", icon: Code2 },
  { key: "feedback", icon: MessageSquareText },
] as const;

export async function ContactTopics() {
  const { t } = await getTranslator();
  return (
    <section aria-labelledby="contact-topics-heading" className="space-y-5">
      <h2 id="contact-topics-heading" className="text-2xl font-semibold">{t("contact.topicsTitle")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map(({ key, icon: Icon }) => <article key={key} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"><Icon aria-hidden="true" className="size-5 shrink-0 text-primary" /><h3 className="text-sm font-semibold">{t(`contact.topics.${key}`)}</h3></article>)}
      </div>
    </section>
  );
}
