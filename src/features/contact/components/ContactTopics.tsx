import * as React from "react";
import { BriefcaseBusiness, Code2, Lightbulb, MessageSquareText } from "lucide-react";

const topics = [
  { title: "Cơ hội Frontend Developer", icon: BriefcaseBusiness },
  { title: "Hợp tác xây dựng sản phẩm", icon: Lightbulb },
  { title: "React, Next.js và TypeScript", icon: Code2 },
  { title: "Góp ý cho Shanverse", icon: MessageSquareText },
];

export function ContactTopics() {
  return (
    <section aria-labelledby="contact-topics-heading" className="space-y-5">
      <h2 id="contact-topics-heading" className="text-2xl font-semibold">Bạn có thể liên hệ về</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map(({ title, icon: Icon }) => <article key={title} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"><Icon aria-hidden="true" className="size-5 shrink-0 text-primary" /><h3 className="text-sm font-semibold">{title}</h3></article>)}
      </div>
    </section>
  );
}
